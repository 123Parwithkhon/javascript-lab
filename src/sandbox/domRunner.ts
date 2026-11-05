import { buildDomFrame, type DomFrameOptions } from './domFrame';
import { LIMITS } from './limits';
import { prepareCode } from './loopGuard';
import type { LogLevel, OutputLine, ProbeValues, RunHandle, RunResult } from './types';

const LOG_LEVELS: readonly string[] = ['log', 'info', 'warn', 'error'];
const STARTUP_TIMEOUT_MS = 20_000;

export interface DomRunOptions extends DomFrameOptions {
  /** Куда показать страницу. Без него страница скрыта и удаляется после проверки. */
  container?: HTMLElement;
}

/**
 * Запускает код ученика на настоящей странице в изолированном iframe. Защита:
 * sandbox без allow-same-origin закрывает данные сайта, а CSP закрывает сеть.
 * Сообщения из песочницы считаются недоверенными, как и в runner.ts.
 */
export function runDom(
  code: string,
  onOutput: (lines: OutputLine[]) => void,
  options: DomRunOptions,
): RunHandle {
  if (code.length > LIMITS.maxCodeChars) {
    return { result: Promise.resolve({ status: 'code-too-large' }), stop: () => {} };
  }

  const { container } = options;
  let finish: (value: RunResult) => void = () => {};
  let finished = false;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let iframe: HTMLIFrameElement | null = null;
  let probe: ProbeValues = {};
  let lineCount = 0;
  let charCount = 0;
  let loads = 0;
  let syntaxLine: number | null = null;

  const teardown = () => {
    window.removeEventListener('message', onMessage);
    iframe?.remove();
    iframe = null;
  };

  const onMessage = (event: MessageEvent<unknown>) => {
    if (!iframe || event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (typeof data !== 'object' || data === null) return;
    const message = data as Record<string, unknown>;

    switch (message.type) {
      case 'ready':
        clearTimeout(timer);
        if (!finished) {
          const limit = container ? LIMITS.timeoutMs : LIMITS.domCheckTimeoutMs;
          timer = setTimeout(() => finish({ status: 'timeout' }), limit);
        }
        return;
      case 'log': {
        const text = (typeof message.text === 'string' ? message.text : '').slice(0, LIMITS.maxOutputChars);
        lineCount += 1;
        charCount += text.length;
        if (lineCount > LIMITS.maxOutputLines || charCount > LIMITS.maxOutputChars) {
          // Страница могла уже показать результат, поэтому при переполнении закрываем её.
          finish({ status: 'output-limit' });
          teardown();
          return;
        }
        const level = LOG_LEVELS.includes(message.level as string) ? (message.level as LogLevel) : 'log';
        onOutput([{ level, text }]);
        return;
      }
      case 'probe':
        if (typeof message.values === 'object' && message.values !== null) {
          probe = {};
          for (const [key, item] of Object.entries(message.values)) {
            probe[key] = typeof item === 'string' ? item.slice(0, LIMITS.maxOutputChars) : null;
          }
        }
        return;
      case 'timeout':
        finish({ status: 'timeout' });
        return;
      case 'done':
        finish({ status: 'success', probe });
        return;
      case 'error': {
        const error = {
          name: (typeof message.name === 'string' ? message.name : 'Error').slice(0, 100),
          message: (typeof message.message === 'string' ? message.message : '').slice(0, 1000),
          line: typeof message.line === 'number' ? message.line : null,
        };
        // Safari не называет синтаксическую ошибку, поэтому определяем её сами.
        if (error.message.startsWith('Script error') && syntaxLine !== null) {
          error.name = 'SyntaxError';
          error.message = 'В коде есть синтаксическая ошибка';
          error.line = syntaxLine;
        }
        if (finished) {
          // Ошибка в обработчике, когда ученик уже нажимает на кнопки на странице.
          onOutput([{ level: 'error', text: `${error.name}: ${error.message}` }]);
        } else {
          finish({ status: 'error', error });
        }
        return;
      }
    }
  };

  const result = new Promise<RunResult>((resolve) => {
    finish = (value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      // Показанная страница остаётся: с ней работают и после запуска. Скрытая больше не нужна.
      if (!container || value.status === 'timeout') teardown();
      resolve(value);
    };
  });

  const stop = () => {
    cancelled = true;
    finish({ status: 'stopped' });
    teardown();
  };

  void prepareCode(code)
    .then(({ guarded, syntaxLine: line }) => {
      if (cancelled) return;
      syntaxLine = line;
      iframe = document.createElement('iframe');
      // allow-forms нужен, чтобы срабатывало событие submit. Сама отправка закрыта правилом CSP.
      iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
      iframe.title = 'Страница программы';
      if (container) {
        iframe.className = 'dom-preview__frame';
      } else {
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        iframe.setAttribute('inert', '');
        // В видимой области, но прозрачно: фреймы за её пределами браузеры сильно замедляют.
        iframe.style.cssText =
          'position:fixed;left:0;top:0;width:600px;height:400px;border:0;opacity:0;pointer-events:none;z-index:-1';
      }
      iframe.srcdoc = buildDomFrame(guarded, options);
      // Страница не должна уходить на другой адрес: в этом случае там будет уже не код ученика.
      iframe.addEventListener('load', () => {
        loads += 1;
        if (loads > 1) {
          finish({ status: 'sandbox-failed' });
          teardown();
        }
      });
      window.addEventListener('message', onMessage);
      timer = setTimeout(() => finish({ status: 'sandbox-failed' }), STARTUP_TIMEOUT_MS);
      if (container) container.replaceChildren(iframe);
      else document.body.appendChild(iframe);
    })
    .catch(() => finish({ status: 'sandbox-failed' }));

  return { result, stop };
}
