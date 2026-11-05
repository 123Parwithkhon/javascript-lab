import { expect, test } from '@playwright/test';
import { diagnose } from '../src/checker/diagnose';
import { LESSONS } from '../src/content/lessons';
import { QUIZZES } from '../src/content/lessons/quizzes';
import { TASKS } from '../src/content/tasks';
import { dailyTask } from '../src/progress/daily';
import { decodeCode, encodeCode } from '../src/sandbox/shareLink';
import { setCode } from './helpers';

const consoleBox = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Консоль' });

test.describe('асинхронный код', () => {
  test('таймеры и промисы успевают выполниться, порядок верный', async ({ page }) => {
    await page.goto('/playground');
    await setCode(
      page,
      'setTimeout(() => console.log("таймер"), 20);\nPromise.resolve().then(() => console.log("промис"));\nconsole.log("сразу");',
    );
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    expect(await consoleBox(page).locator('.console__line').allTextContents()).toEqual(['сразу', 'промис', 'таймер']);
  });

  test('ошибка в таймере и отклонённый промис показываются', async ({ page }) => {
    await page.goto('/playground');
    await setCode(page, 'setTimeout(() => { missingName(); }, 5);');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('ReferenceError');

    await setCode(page, 'Promise.reject(new TypeError("сбой"));');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('TypeError');
  });

  test('бесконечный setInterval останавливается по времени', async ({ page }) => {
    await page.goto('/playground');
    await setCode(page, 'setInterval(() => {}, 10);');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('дольше 3 секунд');
  });

  test('clearInterval завершает программу', async ({ page }) => {
    await page.goto('/playground');
    await setCode(page, 'let n = 0;\nconst id = setInterval(() => {\n  n++;\n  console.log(n);\n  if (n === 2) clearInterval(id);\n}, 5);');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    expect(await consoleBox(page).locator('.console__line').allTextContents()).toEqual(['1', '2']);
  });
});

test.describe('рисование', () => {
  test('пример рисует на холсте', async ({ page }) => {
    await page.goto('/playground');
    await page.getByLabel('Пример').selectOption({ label: 'Шахматная доска' });
    await page.getByRole('button', { name: 'Запустить' }).click();
    const canvas = page.getByRole('img', { name: 'Рисунок программы' });
    await expect(canvas).toBeVisible();
    await expect(consoleBox(page)).toContainText('Программа завершилась.');
    await expect(consoleBox(page)).not.toContainText('ничего не вывела');
    const painted = await canvas.evaluate((element) => {
      const node = element as HTMLCanvasElement;
      const data = node.getContext('2d')?.getImageData(0, 0, node.width, node.height).data ?? [];
      let count = 0;
      for (let index = 3; index < data.length; index += 4) if (data[index] !== 0) count++;
      return count;
    });
    expect(painted).toBeGreaterThan(0);
  });

  test('неверные координаты игнорируются, а поток точек ограничен', async ({ page }) => {
    await page.goto('/playground');
    await setCode(page, 'pixel(-1, 999, "red");\npixel("x", 1, "url(x)");\nconsole.log("ок");');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('ок');
    await expect(page.getByRole('img', { name: 'Рисунок программы' })).toHaveCount(0);

    await setCode(page, 'while (true) { pixel(1, 1, "red"); }');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('слишком много');
  });
});

test.describe('разбор ошибок', () => {
  test('распознаёт типичные ошибки и молчит, если причина неясна', () => {
    const output = (expected: string[], actual: string[]) => diagnose({ kind: 'wrong-output', expected, actual });
    expect(diagnose({ kind: 'wrong-return', call: 'f', expected: '5', actual: '"5"' })).toBe('string-instead-of-number');
    expect(diagnose({ kind: 'wrong-return', call: 'f', expected: '"5"', actual: '5' })).toBe('number-instead-of-string');
    expect(output(['а', 'б'], ['б', 'а'])).toBe('wrong-order');
    expect(output(['Привет'], ['привет'])).toBe('case-differs');
    expect(output(['а б'], ['а  б'])).toBe('spacing-differs');
    expect(output(['Привет, мир!'], ['Привет мир'])).toBe('punctuation-differs');
    expect(output(['а'], [])).toBe('no-output');
    expect(output(['1', '2'], ['1', '2', '3'])).toBe('one-line-extra');
    expect(output(['1', '2', '3'], ['1', '2'])).toBe('one-line-missing');
    expect(output(['1'], ['совсем другое'])).toBeNull();
    expect(diagnose({ kind: 'missing-function', name: 'f' })).toBeNull();
  });

  test('подсказка видна на странице задания', async ({ page }) => {
    await page.goto('/trainer/first-log');
    await setCode(page, 'console.log("привет, мир!");');
    await page.getByRole('button', { name: 'Проверить решение' }).click();
    await expect(page.getByText('Отличается только регистр')).toBeVisible();
  });
});

test.describe('предскажи результат', () => {
  test('вопрос есть в каждом уроке', () => {
    for (const lesson of LESSONS) {
      const quiz = QUIZZES[lesson.slug];
      expect(quiz, lesson.slug).toBeDefined();
      expect(quiz?.options[quiz.answer], lesson.slug).toBeDefined();
    }
  });

  for (const [slug, quiz] of Object.entries(QUIZZES)) {
    test(`${slug}: правильный ответ совпадает с настоящим результатом`, async ({ page }) => {
      await page.goto('/playground');
      await setCode(page, quiz.code);
      await page.getByRole('button', { name: 'Запустить' }).click();
      await expect(consoleBox(page)).toContainText('Программа завершилась');
      const lines = await consoleBox(page).locator('.console__line').allTextContents();
      expect(lines.join(' ')).toBe(quiz.options[quiz.answer]);
    });
  }

  test('ответ раскрывается только после выбора', async ({ page }) => {
    await page.goto('/learn/functions');
    await expect(page.getByText('В функции нет return')).toHaveCount(0);
    await page.getByRole('button', { name: '8', exact: true }).click();
    await expect(page.getByText('В функции нет return')).toBeVisible();
    await expect(page.getByText('Не совсем.')).toBeVisible();
  });
});

test.describe('задание дня', () => {
  const solved = (count: number) =>
    Object.fromEntries(TASKS.slice(0, count).map((task) => [task.id, '2026-01-01T00:00:00.000Z']));

  test('появляется после трёх решённых и не меняется в течение дня', () => {
    expect(dailyTask(TASKS, solved(2), new Date(2026, 0, 5, 9))).toBeUndefined();
    const morning = dailyTask(TASKS, solved(10), new Date(2026, 0, 5, 9));
    const evening = dailyTask(TASKS, solved(10), new Date(2026, 0, 5, 22));
    expect(morning).toBeDefined();
    expect(morning?.id).toBe(evening?.id);
    expect(Object.keys(solved(10))).toContain(morning?.id);
  });
});

test.describe('ссылка на код', () => {
  test('кодирование сохраняет кириллицу и отвергает плохие данные', () => {
    const code = 'console.log("Салом, мир + / = ✓");\n';
    expect(decodeCode(encodeCode(code))).toBe(code);
    expect(decodeCode('#other=1')).toBeNull();
    expect(decodeCode('#code=@@@')).toBeNull();
    expect(decodeCode(encodeCode('x'.repeat(20_001)))).toBeNull();
  });

  test('ссылка открывает код, но не запускает его сама', async ({ page }) => {
    const code = 'console.log("из ссылки");';
    await page.goto(`/playground${encodeCode(code)}`);
    await expect(page.locator('.cm-content')).toContainText('из ссылки');
    await expect(consoleBox(page)).not.toContainText('Программа завершилась');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('из ссылки');
  });

  test('кнопка создаёт рабочую ссылку', async ({ page }) => {
    await page.goto('/playground');
    await setCode(page, 'console.log("поделиться");');
    await page.getByRole('button', { name: 'Поделиться' }).click();
    const url = await page.getByLabel('Ссылка на ваш код').inputValue();
    await page.goto(url);
    await expect(page.locator('.cm-content')).toContainText('поделиться');
  });
});

test.describe('защита страницы', () => {
  test('сама страница тоже не может отправлять данные на чужие адреса', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() =>
      fetch('https://example.com/', { mode: 'no-cors' }).then(
        () => 'ушло',
        () => 'заблокировано',
      ),
    );
    expect(result).toBe('заблокировано');
  });
});

test.describe('работа без интернета', () => {
  test.use({ serviceWorkers: 'allow' });

  test('после первого открытия сайт работает без сети', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    await page.goto('/learn/arrays');
    await expect(page.getByRole('heading', { level: 1, name: 'Массивы' })).toBeVisible();
    await expect(page.locator('.cm-content')).toBeVisible();
    await page.getByRole('button', { name: 'Запустить' }).click();
    await expect(consoleBox(page)).toContainText('Программа завершилась');
    await context.setOffline(false);
  });
});

test('страница о проекте открывается из подвала', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'О проекте' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'О проекте' })).toBeVisible();
});
