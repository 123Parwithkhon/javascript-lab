import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.THEME_SHOTS;

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('тема переключается, запоминается и не зависит от системы', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/profile');
  const light = await background(page);

  await page.getByRole('button', { name: 'Включить тёмную тему' }).click();
  await expect.poll(() => background(page)).not.toBe(light);
  const dark = await background(page);

  await page.reload();
  expect(await background(page)).toBe(dark);
  await expect(page.getByRole('button', { name: 'Включить светлую тему' })).toBeVisible();

  await page.getByRole('button', { name: 'Включить светлую тему' }).click();
  await expect.poll(() => background(page)).toBe(light);

  // Выбор пользователя сильнее настройки системы.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  expect(await background(page)).toBe(light);
});

test('без выбора тема следует настройке системы', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const light = await background(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => background(page)).not.toBe(light);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`профиль и награды в теме ${scheme}: текст контрастный`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript(() => {
      const date = new Date().toISOString();
      localStorage.setItem(
        'jslab.progress.v1',
        JSON.stringify({
          solved: { 'first-log': date, comments: date, 'first-variable': date, 'let-change': date, 'typeof-value': date },
          clean: { 'first-log': date },
          drafts: { 'read-error': 'const message = "Код работает";\nconsole.log(message);\n' },
        }),
      );
    });

    const contrast = () =>
      page.evaluate(() => {
        const parse = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
        const luminance = ([r = 0, g = 0, b = 0]: number[]) => {
          const part = (v: number) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * part(r) + 0.7152 * part(g) + 0.0722 * part(b);
        };
        const backgroundOf = (element: Element | null): number[] => {
          for (let node = element; node; node = node.parentElement) {
            const value = parse(getComputedStyle(node).backgroundColor);
            if (value.length === 3 || (value.length === 4 && value[3] !== 0)) return value;
          }
          return [255, 255, 255];
        };
        const selector =
          '.rank-panel p, .stats dt, .stats dd, .achievement b, .achievement__text, .reward p, .reward__bonus, .feedback p, .feedback h2, .trainer-stats';
        const rows = [...document.querySelectorAll(selector)].map((element) => {
          const a = luminance(parse(getComputedStyle(element).color));
          const b = luminance(backgroundOf(element));
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          return { text: (element.textContent ?? '').slice(0, 30), ratio: Math.round(ratio * 10) / 10 };
        });
        return rows.filter((row) => row.ratio < 4.5);
      });

    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto('/profile');
    await expect(page.getByText('Разогрев')).toBeVisible();
    expect(await contrast()).toEqual([]);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/profile-${scheme}.png` });

    await page.goto('/trainer/read-error');
    await page.getByRole('button', { name: 'Проверить решение' }).click();
    await expect(page.getByText('Тема пройдена')).toBeVisible();
    expect(await contrast()).toEqual([]);
    await page.waitForTimeout(1800);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/reward-${scheme}.png` });
  });
}
