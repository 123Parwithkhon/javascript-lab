/**
 * Страница, которая выполняет код ученика. Защита состоит из трёх уровней:
 *
 * 1. iframe с sandbox="allow-scripts" и без allow-same-origin получает
 *    отдельный непрозрачный origin, поэтому не видит наш localStorage, cookies и DOM.
 * 2. CSP ниже запрещает сеть: default-src 'none' закрывает fetch, XHR, WebSocket
 *    и загрузку внешних скриптов.
 * 3. Web Worker выполняет код вне основного потока. Бесконечный цикл не вешает
 *    страницу, а удаление iframe уничтожает Worker вместе с циклом.
 *
 * Код вне этого файла и runner.ts не должен работать с песочницей напрямую.
 */

/** Этот код работает внутри Worker и запускается раньше кода ученика. */
const WORKER_BOOTSTRAP = String.raw`
(() => {
  const post = self.postMessage.bind(self);

  const format = (value, depth, seen) => {
    if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
    if (typeof value === 'function') return '[Function: ' + (value.name || 'anonymous') + ']';
    if (typeof value === 'bigint') return value + 'n';
    if (value === null || typeof value !== 'object') return String(value);
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (seen.includes(value)) return '[Circular]';
    if (depth > 4) return Array.isArray(value) ? '[Array]' : '[Object]';
    const next = seen.concat([value]);
    if (Array.isArray(value)) {
      return '[' + value.map((item) => format(item, depth + 1, next)).join(', ') + ']';
    }
    const body = Object.keys(value)
      .map((key) => key + ': ' + format(value[key], depth + 1, next))
      .join(', ');
    return body ? '{ ' + body + ' }' : '{}';
  };

  const safeFormat = (value) => {
    try {
      return format(value, 0, []);
    } catch {
      return '[значение нельзя показать]';
    }
  };

  const logger = (level) => (...args) => {
    post({ type: 'log', level, text: args.map(safeFormat).join(' ') });
  };

  self.console = {
    log: logger('log'),
    info: logger('info'),
    debug: logger('log'),
    warn: logger('warn'),
    error: logger('error'),
  };

  const lineFromStack = (error, url) => {
    const stack = String((error && error.stack) || '');
    const index = stack.indexOf(url);
    if (index === -1) return null;
    const match = /^:(\d+)/.exec(stack.slice(index + url.length));
    return match ? Number(match[1]) : null;
  };

  self.onmessage = (event) => {
    self.onmessage = null;
    const url = URL.createObjectURL(new Blob([String(event.data)], { type: 'text/javascript' }));
    self.onerror = (message, source, line) => {
      const text = String(message);
      const name = /(\w*Error)/.exec(text);
      post({
        type: 'error',
        name: name ? name[1] : 'Error',
        message: text.replace(/^(Uncaught )?(\w*Error: )?/, ''),
        line: source === url && line ? line : null,
      });
      return true;
    };
    try {
      // importScripts, а не eval: номера строк совпадают с кодом ученика,
      // а CSP обходится без 'unsafe-eval'.
      importScripts(url);
      post({ type: 'done' });
    } catch (error) {
      post({
        type: 'error',
        name: String((error && error.name) || 'Error'),
        message: String((error && error.message) || error),
        line: lineFromStack(error, url),
      });
    }
  };

  post({ type: 'ready' });
})();
`;

const RELAY = String.raw`
const source = ${JSON.stringify(WORKER_BOOTSTRAP)};
const workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
const worker = new Worker(workerUrl);
worker.onmessage = (event) => parent.postMessage(event.data, '*');
worker.onerror = (event) => {
  event.preventDefault();
  parent.postMessage({ type: 'error', name: 'Error', message: String(event.message), line: null }, '*');
};
window.addEventListener('message', (event) => {
  if (event.source === parent) worker.postMessage(event.data);
});
`;

const CSP = "default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:";

export const FRAME_HTML = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}"></head><body><script>${RELAY}</script></body></html>`;
