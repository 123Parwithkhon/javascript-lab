import { expect, test } from '@playwright/test';
import { LESSONS } from '../src/content/lessons';
import { LESSON_SLUGS } from '../src/content/lessons/slugs';
import { TASKS } from '../src/content/tasks';
import { setCode } from './helpers';

test('данные уроков согласованы с курсом', () => {
  expect(LESSONS).toHaveLength(19);
  expect(new Set(LESSONS.map((lesson) => lesson.slug)).size).toBe(LESSONS.length);

  const taskModules = new Set(TASKS.map((task) => task.moduleId));
  expect(new Set(LESSONS.map((lesson) => lesson.moduleId))).toEqual(taskModules);

  for (const lesson of LESSONS) {
    expect(LESSON_SLUGS[lesson.moduleId], 'адрес урока для главной страницы').toBe(lesson.slug);
    expect(lesson.explanation.length, lesson.slug).toBeGreaterThan(0);
    expect(lesson.recap.length, lesson.slug).toBeGreaterThan(0);
    for (const line of lesson.lines) {
      expect(lesson.code.includes(line.code), `${lesson.slug}: ${line.code}`).toBe(true);
    }
  }
});

for (const lesson of LESSONS) {
  test(`${lesson.slug}: пример выводит то, что написано в уроке`, async ({ page }) => {
    await page.goto(`/learn/${lesson.slug}`);
    await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
    const consoleBox = page.getByRole('region', { name: 'Консоль' });

    // Сначала интерактивный пример в исходном виде: он должен работать без правок.
    await expect(page.locator('.cm-content')).toBeVisible();
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox).toContainText('Программа завершилась');
    await expect(consoleBox.locator('.status--error')).toHaveCount(0);

    // Затем пример из текста урока: результат должен совпасть построчно.
    await setCode(page, lesson.code);
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox).toContainText('Программа завершилась');
    expect(await consoleBox.locator('.console__line').allTextContents()).toEqual(lesson.output);
  });
}

test('урок отмечается пройденным при переходе к практике, отметка сохраняется', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByText(`Пройдено уроков: 0 из ${LESSONS.length}`)).toBeVisible();

  await page.getByRole('link', { name: /Начать: Как работает программа/ }).click();
  await page.getByRole('link', { name: /К практике: Первая строка/ }).click();
  await expect(page.getByRole('heading', { name: 'Первая строка' })).toBeVisible();

  await page.goto('/learn');
  await page.reload();
  await expect(page.getByText(`Пройдено уроков: 1 из ${LESSONS.length}`)).toBeVisible();
  await expect(page.getByRole('link', { name: /Продолжить: Переменные и типы данных/ })).toBeVisible();
});

test('из урока можно перейти к следующему, а задание ведёт обратно к уроку', async ({ page }) => {
  await page.goto('/learn/variables');
  await page.getByRole('link', { name: /Следующий урок: Операторы/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Операторы' })).toBeVisible();

  await page.goto('/trainer/first-variable');
  await page.getByRole('link', { name: 'Урок по этой теме' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Переменные и типы данных' })).toBeVisible();
});

test('на телефоне все пункты меню помещаются в одну строку с переключателем темы', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/learn');
  const links = page.locator('.site-nav a');
  await expect(links).toHaveCount(5);
  const tops = await links.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
});

test('неизвестный урок показывает страницу «не найдено»', async ({ page }) => {
  await page.goto('/learn/no-such-lesson');
  await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
});

test('страницы уроков и шапка помещаются на экран телефона', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/learn', ...LESSONS.map((lesson) => `/learn/${lesson.slug}`)]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
