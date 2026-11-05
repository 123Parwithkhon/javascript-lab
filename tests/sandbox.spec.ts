import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test, type Page } from '@playwright/test';
import { setCode } from './helpers';

async function runInPlayground(page: Page, code: string) {
  await page.goto('/playground');
  await setCode(page, code);
  await page.getByRole('button', { name: 'Запустить' }).click();
}

const consoleBox = (page: Page) => page.getByRole('region', { name: 'Консоль' });

test('первый пример с главной страницы выводит приветствие', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Запустить' }).click();
  await expect(consoleBox(page)).toContainText('Привет, Parviz!');
  await expect(consoleBox(page)).toContainText('Программа завершилась');
});

test('код запускается до загрузки CodeMirror', async ({ page }) => {
  // Файлы редактора в сборке называются dist-*.js, основной файл приложения — index-*.js.
  await page.route('**/assets/dist-*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.editor__fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Запустить' }).click();
  await expect(consoleBox(page)).toContainText('Привет, Parviz!');
});

test('синтаксическая ошибка показывается понятно', async ({ page }) => {
  await runInPlayground(page, 'const a = ;\n');
  await expect(consoleBox(page)).toContainText('SyntaxError');
  await expect(consoleBox(page)).toContainText('Проверьте скобки');
});

test('ошибка выполнения показывает номер строки', async ({ page }) => {
  await runInPlayground(page, 'console.log("старт");\n\nmissingName();\n');
  await expect(consoleBox(page)).toContainText('старт');
  await expect(consoleBox(page)).toContainText('ReferenceError');
  await expect(consoleBox(page)).toContainText('строка 3');
});

test('бесконечный цикл останавливается, а страница не зависает', async ({ page }) => {
  await runInPlayground(page, 'while (true) {}\n');
  await expect(page.getByRole('button', { name: 'Остановить' })).toBeVisible();
  // Этот вызов зависнет, если цикл блокирует основной поток страницы.
  expect(await page.evaluate(() => 1 + 1)).toBe(2);
  await expect(consoleBox(page)).toContainText('дольше 3 секунд');
});

test('кнопка «Остановить» прерывает выполнение', async ({ page }) => {
  await runInPlayground(page, 'while (true) {}\n');
  await page.getByRole('button', { name: 'Остановить' }).click();
  await expect(consoleBox(page)).toContainText('Выполнение остановлено');
});

test('поток вывода ограничивается', async ({ page }) => {
  await runInPlayground(page, 'while (true) { console.log("x"); }\n');
  await expect(consoleBox(page)).toContainText('слишком много данных');
});

test('прямая отправка сообщений в обход console тоже ограничивается', async ({ page }) => {
  await runInPlayground(
    page,
    'while (true) { postMessage({ type: "log", level: "log", text: "x" }); }\n',
  );
  await expect(consoleBox(page)).toContainText('слишком много данных');
});

test('код не имеет доступа к сети', async ({ page }) => {
  // Настоящий приёмник: считаем запросы, которые реально дошли до сервера.
  const hits: string[] = [];
  const server = createServer((request, response) => {
    hits.push(request.url ?? '');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.end('ok');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  const sink = `http://127.0.0.1:${port}`;

  try {
    await runInPlayground(
      page,
      [
        `try { importScripts("${sink}/script"); } catch (e) {}`,
        `try { const x = new XMLHttpRequest(); x.open("GET", "${sink}/xhr", false); x.send(); } catch (e) {}`,
        `try { fetch("${sink}/fetch").catch(() => {}); } catch (e) {}`,
        `try { new WebSocket("ws://127.0.0.1:${port}/ws"); } catch (e) {}`,
        `try { navigator.sendBeacon("${sink}/beacon"); } catch (e) {}`,
        // Ждём, чтобы асинхронные запросы успели уйти до завершения программы.
        'const start = Date.now(); while (Date.now() - start < 800) {}',
        'console.log("КОНЕЦ");',
      ].join('\n'),
    );
    await expect(consoleBox(page)).toContainText('КОНЕЦ');
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await page.waitForTimeout(300);
    expect(hits).toEqual([]);

    // Контроль: приёмник работает, значит, тест умеет видеть утечку.
    await page.request.get(`${sink}/control`);
    expect(hits).toEqual(['/control']);
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test('код не имеет доступа к странице и её данным', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('secret', 'token'));
  await runInPlayground(
    page,
    [
      'console.log("document:" + typeof document);',
      'console.log("window:" + typeof window);',
      'console.log("localStorage:" + typeof localStorage);',
      'console.log("done");',
    ].join('\n'),
  );
  await expect(consoleBox(page)).toContainText('document:undefined');
  await expect(consoleBox(page)).toContainText('window:undefined');
  await expect(consoleBox(page)).toContainText('localStorage:undefined');
});

test('слишком большой код не запускается', async ({ page }) => {
  await runInPlayground(page, `// ${'x'.repeat(20_001)}`);
  await expect(consoleBox(page)).toContainText('Код слишком большой');
});

test('интерфейс не шире экрана телефона', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/playground', '/learn']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
