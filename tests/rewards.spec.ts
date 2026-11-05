import { expect, test } from '@playwright/test';
import { TASKS } from '../src/content/tasks';
import { setCode } from './helpers';
import {
  earnedAchievements,
  rankFor,
  rewardFor,
  streaks,
  totalPoints,
} from '../src/progress/rewards';

const NOW = new Date(2026, 10, 10, 12);
const day = (date: number, hours = 12) => new Date(2026, 10, date, hours).toISOString();

test('серия считает дни подряд, а не количество решений', () => {
  expect(streaks([], NOW)).toEqual({ current: 0, best: 0 });
  expect(streaks([day(10), day(10, 15)], NOW).current).toBe(1);
  expect(streaks([day(8), day(9), day(10)], NOW).current).toBe(3);
});

test('серия не обрывается, пока сегодняшний день не закончился', () => {
  expect(streaks([day(8), day(9)], NOW).current).toBe(2);
  expect(streaks([day(7), day(8)], NOW)).toEqual({ current: 0, best: 2 });
});

test('лучшая серия сохраняется после перерыва', () => {
  expect(streaks([day(1), day(2), day(3), day(9)], NOW)).toEqual({ current: 1, best: 3 });
});

test('повреждённая дата не ломает серию', () => {
  expect(streaks(['не дата', day(10)], NOW).current).toBe(1);
});

test('очки зависят от сложности и решения без подсказок', () => {
  const easy = TASKS.find((task) => task.level === 'easy');
  const hard = TASKS.find((task) => task.level === 'hard');
  if (!easy || !hard) throw new Error('нет заданий');
  expect(totalPoints(TASKS, { solved: { [easy.id]: day(1) }, clean: {} })).toBe(10);
  expect(totalPoints(TASKS, { solved: { [easy.id]: day(1) }, clean: { [easy.id]: day(1) } })).toBe(15);
  expect(totalPoints(TASKS, { solved: { [hard.id]: day(1) }, clean: {} })).toBe(30);
});

test('данные о заданиях вне курса не дают очков', () => {
  expect(totalPoints(TASKS, { solved: { 'no-such-task': day(1) }, clean: {} })).toBe(0);
});

test('ранг меняется на пороге, все задания дают последний ранг', () => {
  expect(rankFor(0).index).toBe(0);
  expect(rankFor(49).index).toBe(0);
  expect(rankFor(50).index).toBe(1);

  const solved = Object.fromEntries(TASKS.map((task) => [task.id, day(1)]));
  const top = rankFor(totalPoints(TASKS, { solved, clean: {} }));
  expect(top.nextAt).toBeNull();
});

test('за повторное решение награды нет, а новое достижение выдаётся один раз', () => {
  const [task] = TASKS;
  if (!task) throw new Error('нет заданий');
  const empty = { solved: {}, clean: {} };
  const once = { solved: { [task.id]: day(10) }, clean: {} };

  const reward = rewardFor(task, TASKS, empty, once, NOW);
  expect(reward?.points).toBe(10);
  expect(reward?.newAchievements).toEqual(['first-task']);
  expect(rewardFor(task, TASKS, once, once, NOW)).toBeNull();
});

test('достижение за все задания требует решить все', () => {
  const solved = Object.fromEntries(TASKS.map((task) => [task.id, day(1)]));
  expect(earnedAchievements(TASKS, { solved, clean: {} }, NOW).has('all-tasks')).toBe(true);
  const [first] = TASKS;
  if (!first) throw new Error('нет заданий');
  delete solved[first.id];
  expect(earnedAchievements(TASKS, { solved, clean: {} }, NOW).has('all-tasks')).toBe(false);
});

test('решение без подсказок даёт бонус и появляется в профиле', async ({ page }) => {
  await page.goto('/trainer/first-log');
  await setCode(page, 'console.log("Привет, мир!");');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByText('+15 очков')).toBeVisible();
  await expect(page.getByText('Первая строка кода')).toBeVisible();

  await page.goto('/profile');
  await expect(page.locator('.stats')).toContainText('15');
  await expect(page.getByText('Новичок')).toBeVisible();
});

test('подсказка и ошибка убирают бонус, но не сами очки', async ({ page }) => {
  await page.goto('/trainer/first-log');
  await page.getByRole('button', { name: 'Показать подсказку 1 из 3' }).click();
  await setCode(page, 'console.log("Привет, мир!");');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByText('+10 очков')).toBeVisible();

  await page.goto('/trainer/first-variable');
  await setCode(page, 'console.log("нет");');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByRole('heading', { name: 'Пока не получилось' })).toBeVisible();
  await setCode(page, 'const name = "Parviz";\nconsole.log(name);');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByText('+10 очков')).toBeVisible();
});

test('повторное решение не добавляет очки', async ({ page }) => {
  await page.goto('/trainer/first-log');
  await setCode(page, 'console.log("Привет, мир!");');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByText('+15 очков')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByRole('heading', { name: 'Верно!' })).toBeVisible();
  await expect(page.getByText(/\+\d+ очков/)).toHaveCount(0);
});

test('завершение темы отмечается, а профиль помещается на экран телефона', async ({ page }) => {
  await page.addInitScript(() => {
    const date = new Date().toISOString();
    localStorage.setItem(
      'jslab.progress.v1',
      JSON.stringify({
        solved: {
          'first-log': date,
          comments: date,
        },
        clean: {},
        drafts: {},
      }),
    );
  });
  await page.goto('/trainer/read-error');
  await setCode(page, 'const message = "Код работает";\nconsole.log(message);');
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  await expect(page.getByText('Тема пройдена')).toBeVisible();

  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/profile');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('все примеры песочницы запускаются без ошибок', async ({ page }) => {
  await page.goto('/playground');
  const select = page.getByLabel('Пример');
  await expect(select).toBeVisible();
  const count = await select.locator('option').count();
  expect(count).toBeGreaterThanOrEqual(6);
  for (let index = 0; index < count; index++) {
    await select.selectOption(String(index));
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(page.getByRole('region', { name: 'Консоль' })).toContainText('Программа завершилась');
    await expect(page.getByRole('region', { name: 'Консоль' }).locator('.status--error')).toHaveCount(0);
  }
});
