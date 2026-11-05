import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Создаёт sw.js со списком файлов сборки, чтобы сайт работал без интернета. */
function offlineSupport(): Plugin {
  return {
    name: 'jslab-offline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle).map((name) => `/${name}`);
      const files = [...built, '/manifest.webmanifest', '/icon.svg'];
      const version = createHash('sha256').update(built.join()).digest('hex').slice(0, 12);
      const template = readFileSync(new URL('./pwa/sw.template.js', import.meta.url), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template.replace('__VERSION__', version).replace('__FILES__', JSON.stringify(files)),
      });
    },
  };
}

/**
 * Ограничивает страницу на случай ошибки в нашем коде. 'unsafe-inline' и blob: нужны
 * песочнице: iframe с srcdoc наследует эти правила, а внутри него свои, более строгие.
 * Только для сборки: режиму разработки нужно своё соединение для обновления страницы.
 */
function contentSecurityPolicy(): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "worker-src 'self' blob:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  return {
    name: 'jslab-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineSupport(), contentSecurityPolicy()],
});
