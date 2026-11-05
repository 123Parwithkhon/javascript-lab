import { FRAME_HTML } from './frameSource';
import { LIMITS } from './limits';
import type { LogLevel, OutputLine, RunHandle, RunResult } from './types';

const LOG_LEVELS: readonly string[] = ['log', 'info', 'warn', 'error'];
const FLUSH_INTERVAL_MS = 50;
/** Запас на создание iframe и Worker на слабом устройстве. Не входит в лимит кода. */
const STARTUP_TIMEOUT_MS = 10_000;

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Запускает код ученика в песочнице. Всё, что приходит из песочницы, считается
 * недоверенным: код ученика может отправить любое сообщение напрямую, минуя
 * наш console. Поэтому лимиты вывода проверяются и здесь.
 */
export function runCode(code: string, onOutput: (lines: OutputLine[]) => void): RunHandle {
  if (code.length > LIMITS.maxCodeChars) {
    return { result: Promise.resolve({ status: 'code-too-large' }), stop: () => {} };
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = 'sandbox';
  iframe.style.display = 'none';
  iframe.srcdoc = FRAME_HTML;

  let finish: (result: RunResult) => void = () => {};
  let finished = false;
  let started = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let buffer: OutputLine[] = [];
  let lineCount = 0;
  let charCount = 0;

  const flush = () => {
    flushTimer = undefined;
    if (buffer.length > 0) {
      onOutput(buffer);
      buffer = [];
    }
  };

  const onMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== iframe.contentWindow || finished) return;
    const data = event.data;
    if (typeof data !== 'object' || data === null) return;
    const message = data as Record<string, unknown>;

    switch (message.type) {
      case 'ready':
        if (started) return;
        started = true;
        clearTimeout(timer);
        timer = setTimeout(() => finish({ status: 'timeout' }), LIMITS.timeoutMs);
        iframe.contentWindow?.postMessage(code, '*');
        return;
      case 'log': {
        const text = toText(message.text, '').slice(0, LIMITS.maxOutputChars);
        lineCount += 1;
        charCount += text.length;
        if (lineCount > LIMITS.maxOutputLines || charCount > LIMITS.maxOutputChars) {
          finish({ status: 'output-limit' });
          return;
        }
        const level = LOG_LEVELS.includes(message.level as string)
          ? (message.level as LogLevel)
          : 'log';
        buffer.push({ level, text });
        flushTimer ??= setTimeout(flush, FLUSH_INTERVAL_MS);
        return;
      }
      case 'done':
        finish({ status: 'success' });
        return;
      case 'error':
        finish({
          status: 'error',
          error: {
            name: toText(message.name, 'Error').slice(0, 100),
            message: toText(message.message, '').slice(0, 1000),
            line: typeof message.line === 'number' ? message.line : null,
          },
        });
        return;
    }
  };

  const result = new Promise<RunResult>((resolve) => {
    finish = (value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clearTimeout(flushTimer);
      window.removeEventListener('message', onMessage);
      iframe.remove(); // Удаление iframe уничтожает и Worker внутри него.
      flush();
      resolve(value);
    };
  });

  window.addEventListener('message', onMessage);
  timer = setTimeout(() => finish({ status: 'sandbox-failed' }), STARTUP_TIMEOUT_MS);
  document.body.appendChild(iframe);

  return { result, stop: () => finish({ status: 'stopped' }) };
}
