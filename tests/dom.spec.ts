import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { expect, test, type Page } from '@playwright/test';
import { guardLoops } from '../src/sandbox/loopGuard';
import { setCode } from './helpers';

const parser = javascriptLanguage.parser as unknown as Parameters<typeof guardLoops>[1];
const G = '__jslabGuard();';
const consoleBox = (page: Page) => page.getByRole('region', { name: 'Консоль' });
const preview = (page: Page) => page.frameLocator('.dom-preview__frame');

async function openUnlocked(page: Page, path: string) {
  await page.addInitScript(() => {
    const date = new Date().toISOString();
    const solved = Object.fromEntries(
      ['dom-text', 'dom-count', 'dom-classes', 'dom-attributes'].map((id) => [id, date]),
    );
    localStorage.setItem('jslab.progress.v1', JSON.stringify({ solved, clean: {}, lessons: {}, drafts: {} }));
  });
  await page.goto(path);
}

test.describe('защита циклов', () => {
  test('проверка попадает во все виды циклов', () => {
    expect(guardLoops('while (a) { b(); }', parser)).toBe(`while (a) {${G} b(); }`);
    expect(guardLoops('for (;;) { }', parser)).toBe(`for (;;) {${G} }`);
    expect(guardLoops('do { x(); } while (a);', parser)).toBe(`do {${G} x(); } while (a);`);
    expect(guardLoops('for (const a of b) c();', parser)).toBe(`for (const a of b) {${G}c();}`);
    expect(guardLoops('while (a) b();', parser)).toBe(`while (a) {${G}b();}`);
  });

  test('вложенные циклы и код без циклов', () => {
    const nested = guardLoops('for (;;) { while (a) { b(); } }', parser);
    expect(nested.split(G)).toHaveLength(3);
    expect(guardLoops('const a = "while (true) {}"; // for (;;) {}', parser)).toBe('const a = "while (true) {}"; // for (;;) {}');
  });

  test('номера строк не меняются', () => {
    const code = 'let a = 1;\nwhile (a) {\n  a = 0;\n}\nconsole.log(a);\n';
    expect(guardLoops(code, parser).split('\n')).toHaveLength(code.split('\n').length);
  });
});

test.describe('страница в песочнице', () => {
  test('код работает с настоящей страницей, и с ней можно взаимодействовать', async ({ page }) => {
    await page.goto('/learn/dom');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await preview(page).getByRole('button', { name: 'Добавить заказ' }).click();
    await expect(preview(page).getByText('Заказ 1')).toBeVisible();
    await preview(page).getByRole('button', { name: 'Добавить заказ' }).click();
    await expect(preview(page).getByText('Заказ 2')).toBeVisible();
  });

  test('бесконечный цикл останавливается, а вкладка живёт', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await setCode(page, 'while (true) {}');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('дольше 3 секунд');
    expect(await page.evaluate(() => 1 + 1)).toBe(2);
    await expect(page.getByRole('button', { name: 'Запустить' })).toBeEnabled();
  });

  test('бесконечный цикл в обработчике тоже останавливается', async ({ page }) => {
    await openUnlocked(page, '/trainer/dom-click-counter');
    await setCode(page, 'document.querySelector("#add").addEventListener("click", () => {\n  while (true) {}\n});');
    await page.getByRole('button', { name: 'Проверить решение' }).click();
    await expect(page.getByRole('heading', { name: 'Пока не получилось' })).toBeVisible();
    expect(await page.evaluate(() => 1 + 1)).toBe(2);
  });

  test('долгая, но конечная работа после загрузки не считается зависанием', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await setCode(page, 'let n = 0;\nfor (let i = 0; i < 2000000; i++) { n += i; }\nconsole.log("готово");');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('готово');
    await expect(consoleBox(page)).toContainText('Программа завершилась');
  });

  test('код не может обратиться к странице сайта и его данным', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await page.evaluate(() => {
      localStorage.setItem('secret', 'token');
      document.cookie = 'secret=token';
    });
    await setCode(
      page,
      [
        'try { console.log("parent:" + parent.document.title); } catch (e) { console.log("parent:" + e.name); }',
        'try { console.log("top:" + top.location.href); } catch (e) { console.log("top:" + e.name); }',
        'try { console.log("cookie:" + document.cookie); } catch (e) { console.log("cookie:" + e.name); }',
        'console.log("storage:" + localStorage.getItem("secret"));',
        'console.log("domain:" + origin);',
      ].join('\n'),
    );
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await expect(consoleBox(page)).toContainText('parent:SecurityError');
    await expect(consoleBox(page)).toContainText('top:SecurityError');
    // Chromium и Firefox выдают ошибку, а Safari пустую строку: главное, что данных нет.
    await expect(consoleBox(page)).not.toContainText('token');
    await expect(consoleBox(page)).toContainText('storage:null');
    await expect(consoleBox(page)).toContainText('domain:null');
  });

  test('код не имеет доступа к сети ни одним из способов', async ({ page }) => {
    const hits: string[] = [];
    const server = createServer((request, response) => {
      hits.push(request.url ?? '');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.end('ok');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const sink = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    try {
      await page.goto('/trainer/dom-text');
      await setCode(
        page,
        [
          `fetch("${sink}/fetch").catch(() => {});`,
          `try { const x = new XMLHttpRequest(); x.open("GET", "${sink}/xhr"); x.send(); } catch (e) {}`,
          `try { new WebSocket("ws://127.0.0.1:${(server.address() as AddressInfo).port}/ws"); } catch (e) {}`,
          `try { navigator.sendBeacon("${sink}/beacon"); } catch (e) {}`,
          `new Image().src = "${sink}/image";`,
          `const s = document.createElement("script"); s.src = "${sink}/script"; document.body.append(s);`,
          `const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "${sink}/css"; document.head.append(l);`,
          `const f = document.createElement("iframe"); f.src = "${sink}/frame"; document.body.append(f);`,
          `document.body.insertAdjacentHTML("beforeend", '<img src="${sink}/html-image">');`,
          'setTimeout(() => console.log("КОНЕЦ"), 400);',
        ].join('\n'),
      );
      await page.getByRole('button', { name: 'Запустить' }).click();
      await expect(consoleBox(page)).toContainText('Программа завершилась');
      await page.waitForTimeout(300);
      expect(hits).toEqual([]);

      // Отправка формы проверяется отдельно: она обрывает запуск, но запрос не должен уйти.
      await setCode(page, `const form = document.createElement("form"); form.action = "${sink}/form"; document.body.append(form); form.submit();`);
      await page.getByRole('button', { name: 'Запустить' }).click();
      await expect(consoleBox(page).locator('.status').filter({ hasNotText: 'Выполняется' })).toBeVisible();
      await page.waitForTimeout(300);
      expect(hits).toEqual([]);

      await page.request.get(`${sink}/control`);
      expect(hits).toEqual(['/control']);
    } finally {
      server.closeAllConnections();
      server.close();
    }
  });

  test('уход страницы на другой адрес прерывает запуск', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await setCode(page, 'location.href = "about:blank";');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(page.locator('.dom-preview__frame')).toHaveCount(0);
    expect(await page.evaluate(() => 1 + 1)).toBe(2);
  });

  test('синтаксис и текст script в коде не ломают страницу, номер строки верный', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await setCode(page, 'console.log("</script><b>не тег</b>");\nconsole.log("<!-- не комментарий -->");');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('</script><b>не тег</b>');
    await expect(consoleBox(page)).toContainText('<!-- не комментарий -->');

    await setCode(page, 'console.log("старт");\n\nmissingName();');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('ReferenceError');
    await expect(consoleBox(page)).toContainText('строка 3');

    await setCode(page, 'const a = ;');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('SyntaxError');
  });

  test('ошибка в обработчике видна в консоли', async ({ page }) => {
    await openUnlocked(page, '/trainer/dom-click-counter');
    await setCode(page, 'document.querySelector("#add").addEventListener("click", () => {\n  missingName();\n});');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await preview(page).getByRole('button', { name: 'Добавить' }).click();
    await expect(consoleBox(page)).toContainText('ReferenceError');
  });

  test('поток вывода из страницы ограничивается', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await setCode(page, 'for (let i = 0; i < 100000; i++) { console.log("x"); }');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('слишком много');
  });

  test('повторный запуск заменяет страницу', async ({ page }) => {
    await page.goto('/trainer/dom-text');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await expect(page.locator('.dom-preview__frame')).toHaveCount(1);
    // Результат такой программы — сама страница, поэтому совет про console.log здесь неуместен.
    await expect(consoleBox(page)).not.toContainText('ничего не вывела');
  });

  test('проекты показаны на отдельной странице', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { level: 2, name: '1. Калькулятор' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '5. Поиск через API' })).toBeVisible();
    await page.getByRole('link', { name: 'Начать проект' }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: 'Калькулятор' })).toBeVisible();
    await expect(page.getByText('HTML страницы')).toBeVisible();
  });

  test('этапы проекта проверяются по порядку и подсказывают, на каком этапе ошибка', async ({ page }) => {
    await page.addInitScript(() => {
      const date = new Date().toISOString();
      localStorage.setItem('jslab.progress.v1', JSON.stringify({ solved: { 'project-calculator': date }, clean: {}, lessons: {}, drafts: {} }));
    });
    await page.goto('/trainer/project-calculator');
    await setCode(
      page,
      'document.querySelector("#calc").addEventListener("click", () => {\n  const a = Number(document.querySelector("#a").value);\n  const b = Number(document.querySelector("#b").value);\n  document.querySelector("#result").textContent = a + b;\n});',
    );
    await page.getByRole('button', { name: 'Проверить решение' }).click();
    await expect(page.getByText('Этап 2: все действия')).toBeVisible();
    await expect(page.getByText('Проверка 2 из 3:')).toBeVisible();
  });
});
