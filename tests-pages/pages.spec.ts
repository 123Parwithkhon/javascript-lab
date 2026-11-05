import { expect, test } from '@playwright/test';

const ROOT = 'http://localhost:4174/javascript-lab/';

test('сайт работает по адресу с подпапкой: главная, переход и запуск кода', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });

  await page.goto(ROOT);
  await page.getByRole('button', { name: 'Запустить' }).click();
  await expect(page.getByRole('region', { name: 'Консоль' })).toContainText('Привет, Parviz!');

  await page.getByRole('link', { name: 'Начать обучение' }).click();
  await expect(page).toHaveURL(`${ROOT}learn`);
  await expect(page.getByRole('heading', { level: 1, name: 'Уроки' })).toBeVisible();
  expect(failed).toEqual([]);
});

test('прямая ссылка на урок открывается так, как её отдаёт GitHub Pages', async ({ page, request }) => {
  // GitHub Pages на неизвестный адрес отвечает кодом 404 и содержимым 404.html.
  const fallback = await (await request.get(`${ROOT}404.html`)).text();
  expect(fallback).toContain('id="root"');
  await page.route(`${ROOT}learn/arrays`, (route) =>
    route.fulfill({ status: 404, contentType: 'text/html', body: fallback }),
  );

  await page.goto(`${ROOT}learn/arrays`);
  await expect(page.getByRole('heading', { level: 1, name: 'Массивы' })).toBeVisible();
  await expect(page).toHaveURL(`${ROOT}learn/arrays`);
});

test('значок и манифест найдены', async ({ page, request }) => {
  await page.goto(ROOT);
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBe('/javascript-lab/manifest.webmanifest');

  const manifest = await (await request.get(new URL(manifestHref ?? '', ROOT).href)).json();
  const iconUrl = new URL(manifest.icons[0].src, new URL(manifestHref ?? '', ROOT)).href;
  expect((await request.get(iconUrl)).ok()).toBe(true);
});

test.describe('без интернета', () => {
  test.use({ serviceWorkers: 'allow' });

  test('файлы кэшируются и сайт работает без сети', async ({ page, context }) => {
    await page.goto(ROOT);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    await page.goto(`${ROOT}learn/functions`);
    await expect(page.getByRole('heading', { level: 1, name: 'Функции' })).toBeVisible();
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(page.getByRole('region', { name: 'Консоль' })).toContainText('Программа завершилась');
    await context.setOffline(false);
  });
});
