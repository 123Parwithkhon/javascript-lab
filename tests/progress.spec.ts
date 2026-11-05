import { expect, test } from '@playwright/test';
import { setCode } from './helpers';

const STORAGE_KEY = 'jslab.progress.v1';

test('основной сценарий: выбрал задание, решил, прогресс пережил обновление', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Начать обучение' }).click();
  await expect(page).toHaveURL(/\/learn$/);

  await page.getByRole('link', { name: 'Задания', exact: true }).click();
  await expect(page.getByText('Решено 0 из 135')).toBeVisible();

  await page.getByRole('link', { name: /Начать: Первая строка/ }).click();
  await setCode(page, 'console.log("Привет, мир!");');
  await page.getByRole('button', { name: 'Запустить' }).click();
  await expect(page.getByRole('region', { name: 'Консоль' })).toContainText('Привет, мир!');

  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByRole('heading', { name: 'Верно!' })).toBeVisible();

  await page.getByRole('link', { name: /Дальше: Комментарий/ }).click();
  await expect(page.getByRole('heading', { name: 'Комментарий' })).toBeVisible();

  await page.goto('/trainer');
  await page.reload();
  await expect(page.getByText('Решено 1 из 135')).toBeVisible();
  await expect(page.getByRole('link', { name: /Продолжить: Комментарий/ })).toBeVisible();
});

test('на телефоне результат проверки сразу виден на экране', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/trainer/first-log');
  await setCode(page, 'console.log("нет");');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByRole('heading', { name: 'Пока не получилось' })).toBeInViewport();
});

test('следующее задание закрыто, а первое задание другой темы открыто', async ({ page }) => {
  await page.goto('/trainer/comments');
  await expect(page.getByRole('heading', { name: 'Задание пока закрыто' })).toBeVisible();

  await page.goto('/trainer/first-variable');
  await expect(page.getByRole('heading', { name: 'Первая переменная' })).toBeVisible();
});

test('черновик кода переживает обновление страницы, а сброс возвращает начальный код', async ({ page }) => {
  await page.goto('/trainer/first-log');
  await setCode(page, 'console.log("черновик");');
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.locator('.cm-content')).toContainText('черновик');

  await page.getByRole('button', { name: 'Сбросить код' }).click();
  await expect(page.locator('.cm-content')).toContainText('Напишите команду');
  await expect(page.locator('.cm-content')).not.toContainText('черновик');
});

test('повреждённые данные прогресса не ломают сайт', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{не json'), STORAGE_KEY);
  await page.goto('/trainer');
  await expect(page.getByText('Решено 0 из 135')).toBeVisible();
});

test('неверные данные прогресса не считаются решением', async ({ page }) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ solved: ['first-log'], drafts: 5 })),
    STORAGE_KEY,
  );
  await page.goto('/trainer');
  await expect(page.getByText('Решено 0 из 135')).toBeVisible();
});

test('неизвестное задание показывает страницу «не найдено»', async ({ page }) => {
  await page.goto('/trainer/no-such-task');
  await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
});

test('страницы заданий не шире экрана телефона', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/trainer', '/trainer/first-log', '/trainer/first-variable']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
