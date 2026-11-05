import { FORMAT_SOURCE } from './formatSource';

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

  ${FORMAT_SOURCE}

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

  // Рисование проверяется снаружи: здесь только передаём точку на страницу.
  self.pixel = (x, y, color) => {
    post({ type: 'pixel', x, y, color: String(color) });
  };

  // Считаем незавершённые таймеры, чтобы программа не закончилась раньше них.
  const active = new Set();
  const nativeSetTimeout = self.setTimeout.bind(self);
  const nativeClearTimeout = self.clearTimeout.bind(self);
  const nativeSetInterval = self.setInterval.bind(self);
  const nativeClearInterval = self.clearInterval.bind(self);

  self.setTimeout = (callback, delay, ...args) => {
    const id = nativeSetTimeout(() => {
      active.delete(id);
      if (typeof callback === 'function') callback(...args);
    }, delay);
    active.add(id);
    return id;
  };
  self.clearTimeout = (id) => {
    active.delete(id);
    nativeClearTimeout(id);
  };
  self.setInterval = (callback, delay, ...args) => {
    const id = nativeSetInterval(callback, delay, ...args);
    active.add(id);
    return id;
  };
  self.clearInterval = (id) => {
    active.delete(id);
    nativeClearInterval(id);
  };

  const whenIdle = () =>
    new Promise((resolve) => {
      const check = () => (active.size === 0 ? resolve() : nativeSetTimeout(check, 5));
      nativeSetTimeout(check, 0);
    });

  const lineFromStack = (error, url) => {
    const stack = String((error && error.stack) || '');
    const index = stack.indexOf(url);
    if (index === -1) return null;
    const match = /^:(\d+)/.exec(stack.slice(index + url.length));
    return match ? Number(match[1]) : null;
  };

  // const и let из кода ученика не попадают в свойства self, но видны следующему
  // скрипту. Поэтому значения читает отдельный скрипт, а try отличает отсутствующую
  // переменную от переменной со значением undefined.
  const isIdentifier = (name) => /^[A-Za-z_$][\w$]*$/.test(name);

  const readProbe = (names, calls, expressions) => {
    const lines = names.filter(isIdentifier).map((name) => {
      const key = JSON.stringify(name);
      return 'try { __values[' + key + '] = __serialize(' + name + '); } catch { __values[' + key + '] = null; }';
    });
    // Функция может быть объявлена и через function, и через const, поэтому
    // её тоже вызывает отдельный скрипт. null означает, что функции нет.
    calls.forEach((call, index) => {
      if (!isIdentifier(call.name)) return;
      const key = JSON.stringify('call:' + index);
      lines.push(
        'try { __values[' + key + '] = typeof ' + call.name + " === 'function' ? __serialize(await " +
          call.name + '(...' + JSON.stringify(call.args) + ')) : null; } catch (__error) { __values[' +
          key + "] = 'throw:' + __error; }",
      );
    });
    // Выражения пишет автор задания, а не ученик: это часть условия проверки.
    expressions.forEach((expression, index) => {
      const key = JSON.stringify('expr:' + index);
      lines.push(
        'try { __values[' + key + '] = __serialize(await (' + expression + ')); } catch (__error) { __values[' +
          key + "] = 'throw:' + __error; }",
      );
    });
    if (lines.length === 0) return;
    // Функция проверки асинхронная: результат может быть промисом.
    let finished;
    self.__jslabProbe = (read) => {
      const values = {};
      finished = read(values, serialize).then(() => post({ type: 'probe', values }));
    };
    const source = 'self.__jslabProbe(async (__values, __serialize) => {\n' + lines.join('\n') + '\n});';
    importScripts(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    return finished;
  };

  self.onmessage = (event) => {
    self.onmessage = null;
    const { code, setup, globals, probe, calls, expressions } = event.data;
    // Свойство глобального объекта, а не const: ученик может объявить своё
    // одноимённое значение без ошибки. Так же работает и имя name, которое
    // уже есть в Worker.
    for (const key of Object.keys(globals)) {
      Object.defineProperty(self, key, {
        value: globals[key],
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
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
    const report = (error) =>
      post({
        type: 'error',
        name: String((error && error.name) || 'Error'),
        message: String((error && error.message) || error),
        line: lineFromStack(error, url),
      });
    self.onunhandledrejection = (event) => {
      event.preventDefault();
      report(event.reason);
    };
    const run = async () => {
      if (setup) importScripts(URL.createObjectURL(new Blob([setup], { type: 'text/javascript' })));
      // importScripts, а не eval: номера строк совпадают с кодом ученика,
      // а CSP обходится без 'unsafe-eval'.
      importScripts(url);
      await whenIdle();
      await readProbe(probe, calls, expressions);
      await whenIdle();
      post({ type: 'done' });
    };
    run().catch(report);
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
