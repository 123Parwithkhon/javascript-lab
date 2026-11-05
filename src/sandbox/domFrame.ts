import { FORMAT_SOURCE } from './formatSource';
import { LIMITS } from './limits';

export interface DomPage {
  html: string;
  css?: string;
}

/** Код на странице, который выполняется раньше кода ученика. */
const BOOTSTRAP = String.raw`
(() => {
  const post = (message) => parent.postMessage(message, '*');
  ${FORMAT_SOURCE}

  const logger = (level) => (...args) => {
    post({ type: 'log', level, text: args.map(safeFormat).join(' ') });
  };
  const nativeConsole = { log: logger('log'), info: logger('info'), debug: logger('log'), warn: logger('warn'), error: logger('error') };
  Object.defineProperty(window, 'console', { value: nativeConsole, configurable: true, writable: true });

  // Safari скрывает подробности ошибок на такой странице за текстом «Script error».
  // Поэтому код ученика, обработчики и таймеры выполняются внутри try и сообщают сами.
  const report = (error) => {
    const stack = String((error && error.stack) || '');
    const match = /srcdoc:(\d+)/.exec(stack);
    post({
      type: 'error',
      name: String((error && error.name) || 'Error'),
      message: String((error && error.message) || error),
      line: match ? Number(match[1]) - __LINE_OFFSET__ : null,
    });
  };
  window.__jslabReport = report;

  const safely = (callback) =>
    function (...args) {
      try {
        return callback.apply(this, args);
      } catch (error) {
        report(error);
      }
    };
  const wrapped = new WeakMap();
  const nativeAdd = EventTarget.prototype.addEventListener;
  const nativeRemove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof listener !== 'function') return nativeAdd.call(this, type, listener, options);
    if (!wrapped.has(listener)) wrapped.set(listener, safely(listener));
    return nativeAdd.call(this, type, wrapped.get(listener), options);
  };
  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    return nativeRemove.call(this, type, wrapped.get(listener) ?? listener, options);
  };

  // Окна запрещены песочницей, поэтому выводим их текст в консоль, чтобы код не терял смысл.
  window.alert = (text) => nativeConsole.log(text);
  window.confirm = () => true;
  window.prompt = () => null;

  // Настоящий localStorage в песочнице закрыт: у неё нет доступа к данным сайта.
  // Это учебное хранилище живёт только в рамках одного запуска.
  const items = new Map(Object.entries(__STORAGE__));
  const storage = {
    getItem: (key) => (items.has(String(key)) ? items.get(String(key)) : null),
    setItem: (key, value) => void items.set(String(key), String(value)),
    removeItem: (key) => void items.delete(String(key)),
    clear: () => items.clear(),
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size;
    },
  };
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });

  // Время считается отдельно для каждого непрерывного участка кода.
  let runStart = 0;
  let calls = 0;
  const nativeSetTimeout = window.setTimeout.bind(window);
  window.__jslabGuard = () => {
    calls += 1;
    if (calls % 256 !== 0) return;
    const now = Date.now();
    if (runStart === 0) {
      runStart = now;
      nativeSetTimeout(() => {
        runStart = 0;
      }, 0);
    } else if (now - runStart > __TIMEOUT__) {
      post({ type: 'timeout' });
      throw new Error('Цикл работает слишком долго');
    }
  };

  const active = new Set();
  const nativeClearTimeout = window.clearTimeout.bind(window);
  const nativeSetInterval = window.setInterval.bind(window);
  const nativeClearInterval = window.clearInterval.bind(window);
  window.setTimeout = (callback, delay, ...args) => {
    const id = nativeSetTimeout(() => {
      active.delete(id);
      if (typeof callback === 'function') safely(callback)(...args);
    }, delay);
    active.add(id);
    return id;
  };
  window.clearTimeout = (id) => {
    active.delete(id);
    nativeClearTimeout(id);
  };
  window.setInterval = (callback, delay, ...args) => {
    const id = nativeSetInterval(typeof callback === 'function' ? safely(callback) : callback, delay, ...args);
    active.add(id);
    return id;
  };
  window.clearInterval = (id) => {
    active.delete(id);
    nativeClearInterval(id);
  };
  // Следующий шаг очереди без таймера: браузеры замедляют таймеры во фреймах.
  const nextTask = () =>
    new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve();
      channel.port2.postMessage(null);
    });
  const settled = async () => {
    await nextTask();
    while (active.size > 0) {
      await new Promise((resolve) => nativeSetTimeout(resolve, 5));
      await nextTask();
    }
  };

  window.addEventListener('error', (event) => {
    const text = String(event.message);
    const name = /(\w*Error)/.exec(text);
    post({
      type: 'error',
      name: name ? name[1] : 'Error',
      message: text.replace(/^(Uncaught )?(\w*Error: )?/, ''),
      line: event.lineno ? event.lineno - __LINE_OFFSET__ : null,
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    const reason = event.reason;
    post({
      type: 'error',
      name: String((reason && reason.name) || 'Error'),
      message: String((reason && reason.message) || reason),
      line: null,
    });
  });

  // Действия «ученика» для проверок.
  const get = (selector) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error('На странице нет элемента ' + selector);
    return element;
  };
  window.__jslab = {
    settled,
    text: (selector) => get(selector).textContent.trim(),
    value: (selector) => get(selector).value,
    count: (selector) => document.querySelectorAll(selector).length,
    exists: (selector) => document.querySelector(selector) !== null,
    hasClass: (selector, name) => get(selector).classList.contains(name),
    attr: (selector, name) => get(selector).getAttribute(name),
    click: async (selector) => {
      get(selector).click();
      await settled();
    },
    type: async (selector, text) => {
      const element = get(selector);
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await settled();
    },
    submit: async (selector) => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      get(selector).dispatchEvent(event);
      await settled();
      return event.defaultPrevented;
    },
  };

  window.__jslabFinish = async (read) => {
    await settled();
    if (read) {
      const values = {};
      await read(values, serialize);
      post({ type: 'probe', values });
    }
    await settled();
    post({ type: 'done' });
  };

  post({ type: 'ready' });
})();
`;

const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data:",
  "form-action 'none'",
].join('; ');

/** Текст скрипта не должен закрыть тег script раньше времени. */
function escapeScript(code: string): string {
  return code.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
}

function probeScript(expressions: string[]): string {
  if (expressions.length === 0) return 'window.__jslabFinish();';
  const lines = expressions.map((expression, index) => {
    const key = JSON.stringify(`expr:${index}`);
    return `try { __values[${key}] = __serialize(await (${expression})); } catch (__error) { __values[${key}] = 'throw:' + __error; }`;
  });
  return `window.__jslabFinish(async (__values, __serialize) => {
const { settled, text, value, count, exists, hasClass, attr, click, type, submit } = window.__jslab;
${lines.join('\n')}
});`;
}

export interface DomFrameOptions {
  page: DomPage;
  setup?: string;
  storage?: Record<string, string>;
  expressions?: string[];
}

/** Собирает страницу песочницы. code уже содержит проверки циклов. */
export function buildDomFrame(code: string, options: DomFrameOptions): string {
  const { page, setup, storage, expressions = [] } = options;
  const script = (source: string) => `<script>${escapeScript(source)}</script>`;

  const before = (offset: number) =>
    `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}">` +
    `<style>body{font:16px/1.5 system-ui,sans-serif;margin:12px;color:#16202c;background:#fff}${page.css ?? ''}</style>` +
    `<script>${BOOTSTRAP.replace('__STORAGE__', JSON.stringify(storage ?? {}))
      .replace('__TIMEOUT__', String(LIMITS.timeoutMs))
      .replaceAll('__LINE_OFFSET__', String(offset))}</script></head><body>${page.html}` +
    (setup ? script(setup) : '') +
    '<script>';

  // Браузер считает строки от начала документа, поэтому вычитаем всё, что выше кода ученика.
  const offset = before(0).split('\n').length - 1;

  // try начинается в той же строке, что и код, поэтому номера строк не меняются.
  return `${before(offset)}try{${escapeScript(code)}\n}catch(__error){window.__jslabReport(__error)}</script>${script(probeScript(expressions))}</body></html>`;
}
