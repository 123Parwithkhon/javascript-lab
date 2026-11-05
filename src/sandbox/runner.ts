import { FRAME_HTML } from './frameSource';
import { LIMITS } from './limits';
import type { LogLevel, OutputLine, Pixel, ProbeValues, RunHandle, RunOptions, RunResult } from './types';

const LOG_LEVELS: readonly string[] = ['log', 'info', 'warn', 'error'];
const FLUSH_INTERVAL_MS = 50;
/** Запас на создание iframe и Worker на слабом устройстве. Не входит в лимит кода. */
const STARTUP_TIMEOUT_MS = 20_000;

/** Цвет попадает в canvas, поэтому допускаем только названия и шестнадцатеричную запись. */
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i;

function toPixel(message: Record<string, unknown>): Pixel | null {
  const { x, y, color } = message;
  const inGrid = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < LIMITS.gridSize;
  if (!inGrid(x) || !inGrid(y) || typeof color !== 'string' || !COLOR_PATTERN.test(color)) return null;
  return { x: x as number, y: y as number, color };
}

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toProbeValues(value: unknown): ProbeValues {
  if (typeof value !== 'object' || value === null) return {};
  const result: ProbeValues = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = typeof item === 'string' ? item.slice(0, LIMITS.maxOutputChars) : null;
  }
  return result;
}

/**
 * Запускает код ученика в песочнице. Всё, что приходит из песочницы, считается
 * недоверенным: код ученика может отправить любое сообщение напрямую, минуя
 * наш console. Поэтому лимиты вывода проверяются и здесь.
 */
export function runCode(
  code: string,
  onOutput: (lines: OutputLine[]) => void,
  options: RunOptions = {},
): RunHandle {
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
  let probe: ProbeValues = {};
  let pixelBuffer: Pixel[] = [];
  let pixelCount = 0;

  const flush = () => {
    flushTimer = undefined;
    if (buffer.length > 0) {
      onOutput(buffer);
      buffer = [];
    }
    if (pixelBuffer.length > 0) {
      options.onPixels?.(pixelBuffer);
      pixelBuffer = [];
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
        iframe.contentWindow?.postMessage(
          { code, setup: options.setup ?? '', globals: options.globals ?? {}, probe: options.probe ?? [], calls: options.calls ?? [], expressions: options.expressions ?? [] },
          '*',
        );
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
      case 'pixel': {
        pixelCount += 1;
        if (pixelCount > LIMITS.maxPixels) {
          finish({ status: 'output-limit' });
          return;
        }
        const pixel = toPixel(message);
        if (pixel) {
          pixelBuffer.push(pixel);
          flushTimer ??= setTimeout(flush, FLUSH_INTERVAL_MS);
        }
        return;
      }
      case 'probe':
        probe = toProbeValues(message.values);
        return;
      case 'done':
        finish({ status: 'success', probe });
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
