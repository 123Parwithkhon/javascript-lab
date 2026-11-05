import { expect, test, type Page } from '@playwright/test';
import { TASKS } from '../src/content/tasks';
import { ADVANCED_VALID, ADVANCED_WRONG } from './advancedSolutions';
import { ASYNC_VALID, ASYNC_WRONG } from './asyncSolutions';
import { DOM_VALID, DOM_WRONG } from './domSolutions';
import { EXPERT_VALID, EXPERT_WRONG } from './expertSolutions';
import { setCode } from './helpers';
import { MASTERY_VALID, MASTERY_WRONG } from './masterySolutions';

/**
 * Неверные решения для каждого задания. Они показывают, что проверка смотрит
 * на поведение: подгонка под первый ответ и типичные ошибки не должны проходить.
 */
const WRONG_SOLUTIONS: Record<string, string[]> = {
  ...ADVANCED_WRONG,
  ...EXPERT_WRONG,
  ...ASYNC_WRONG,
  ...DOM_WRONG,
  ...MASTERY_WRONG,
  'first-log': ['console.log("привет, мир");', 'const text = "Привет, мир!";'],
  comments: ['console.log("Начало");\nconsole.log("Конец");\nconsole.log("Лишняя строка");'],
  'read-error': ['console.log("message");'],
  'first-variable': ['console.log("Parviz");', 'const name = "Parviz";', 'const name = "parviz";\nconsole.log(name);'],
  'let-change': ['let score = 10;\nconsole.log(15);', 'const score = 10;\nscore = 15;\nconsole.log(score);'],
  'typeof-value': ['console.log("number");', 'console.log(value);'],
  'template-string': ['console.log("Меня зовут Parviz, я живу в городе Душанбе");', 'console.log(`Меня зовут ${name}`);'],
  'type-conversion': ['const result = text + 5;\nconsole.log(result);', 'const result = 30;\nconsole.log(result);'],
  'order-total': ['const total = 75;\nconsole.log(total);', 'const total = price + quantity;\nconsole.log(total);'],
  'is-even': ['console.log(n % 2 === 1);', 'console.log(n % 2 !== 1);', 'console.log(true);'],
  'strict-equality': ['console.log(a == b);', 'console.log(true);'],
  'logical-and': [
    'const canEnter = age > 18 && hasTicket;\nconsole.log(canEnter);',
    'const canEnter = age >= 18 || hasTicket;\nconsole.log(canEnter);',
    'const canEnter = age >= 18;\nconsole.log(canEnter);',
  ],
  'if-positive': ['console.log("Есть долг");', 'if (balance <= 0) {\n  console.log("Есть долг");\n}'],
  'if-else': [
    'if (temperature > 25) {\n  console.log("Жарко");\n} else {\n  console.log("Прохладно");\n}',
    'console.log("Жарко");',
  ],
  'star-triangle': [
    'console.log("*");\nconsole.log("**");\nconsole.log("***");',
    'for (let i = 1; i <= n; i++) {\n  console.log("*");\n}',
    'for (let i = n; i >= 1; i--) {\n  console.log("*".repeat(i));\n}',
  ],
  fizzbuzz: [
    'for (let i = 1; i <= n; i++) {\n  if (i % 3 === 0) {\n    console.log("Fizz");\n  } else if (i % 5 === 0) {\n    console.log("Buzz");\n  } else if (i % 15 === 0) {\n    console.log("FizzBuzz");\n  } else {\n    console.log(i);\n  }\n}',
    'for (let i = 1; i <= n; i++) {\n  console.log(i);\n}',
  ],
  'for-count': [
    'console.log(1);\nconsole.log(2);\nconsole.log(3);',
    'for (let i = 1; i < n; i++) {\n  console.log(i);\n}',
    'for (let i = 0; i <= n; i++) {\n  console.log(i);\n}',
  ],
  'sum-to-n': [
    'const sum = 15;\nconsole.log(sum);',
    'let sum = 0;\nfor (let i = 1; i < n; i++) {\n  sum += i;\n}\nconsole.log(sum);',
    'let sum = 0;\nfor (let i = 1; i <= n; i++) {\n  sum += i;\n  console.log(sum);\n}',
  ],
  'while-countdown': [
    'while (n > 0) {\n  console.log(n);\n  n--;\n}',
    'while (n >= 0) {\n  console.log(n);\n  n--;\n}\nconsole.log("Старт!");',
    'while (n > 0) {\n  console.log(n);\n}\nconsole.log("Старт!");',
  ],
  'count-digits': [
    'let count = 0;\nwhile (n > 0) {\n  n = Math.floor(n / 10);\n  count++;\n}\nconsole.log(count);',
    'const count = 3;\nconsole.log(count);',
  ],
  'odd-numbers': [
    'for (let i = 1; i <= n; i++) {\n  console.log(i);\n}',
    'for (let i = 2; i <= n; i += 2) {\n  console.log(i);\n}',
  ],
  'smallest-divisor': [
    'for (let i = 2; i <= n; i++) {\n  if (n % i === 0) {\n    console.log(i);\n  }\n}',
    'for (let i = 1; i <= n; i++) {\n  if (n % i === 0) {\n    console.log(i);\n    break;\n  }\n}',
  ],
  'number-table': [
    'for (let row = 1; row <= n; row++) {\n  for (let col = 1; col <= n; col++) {\n    console.log(row * col);\n  }\n}',
    'console.log("1 2");\nconsole.log("2 4");',
  ],
  'sum-function': [
    'function sum(a, b) {\n  console.log(a + b);\n}',
    'function sum(a, b) {\n  return 5;\n}',
    'function sum(a, b) {\n  return a - b;\n}',
    'function add(a, b) {\n  return a + b;\n}',
  ],
  'greet-function': [
    'function greet(name) {\n  console.log(`Привет, ${name}!`);\n}',
    'function greet(name) {\n  return "Привет, Parviz!";\n}',
  ],
  'max-of-two': [
    'function maxOf(a, b) {\n  return a;\n}',
    'function maxOf(a, b) {\n  if (a > b) {\n    return a;\n  }\n}',
    'function maxOf(a, b) {\n  return a + b;\n}',
  ],
  'default-discount': [
    'function applyDiscount(price, percent) {\n  return price - price * percent / 100;\n}',
    'function applyDiscount(price, percent) {\n  percent = percent || 10;\n  return price - price * percent / 100;\n}',
  ],
  'arrow-is-adult': [
    'const isAdult = (age) => age > 18;',
    'const isAdult = (age) => true;',
    'const isAdult = (age) => {\n  age >= 18;\n};',
  ],
  'is-prime': [
    'function isPrime(n) {\n  return n % 2 !== 0;\n}',
    'function isPrime(n) {\n  for (let i = 2; i < n; i++) {\n    if (n % i === 0) {\n      return false;\n    }\n  }\n  return true;\n}',
  ],
  'else-if-grade': [
    'if (score >= 50) {\n  console.log("Удовлетворительно");\n} else if (score >= 70) {\n  console.log("Хорошо");\n} else if (score >= 90) {\n  console.log("Отлично");\n} else {\n  console.log("Нужно повторить");\n}',
    'if (score > 90) {\n  console.log("Отлично");\n} else if (score > 70) {\n  console.log("Хорошо");\n} else if (score > 50) {\n  console.log("Удовлетворительно");\n} else {\n  console.log("Нужно повторить");\n}',
  ],
};

/** Другие верные способы: проверка не должна требовать единственную запись. */
const OTHER_VALID_SOLUTIONS: Record<string, string[]> = {
  ...ADVANCED_VALID,
  ...EXPERT_VALID,
  ...ASYNC_VALID,
  ...DOM_VALID,
  ...MASTERY_VALID,
  'first-variable': ['let name = "Parviz";\nconsole.log(name);'],
  'star-triangle': ['for (let i = 1; i <= n; i++) {\n  let line = "";\n  for (let j = 0; j < i; j++) {\n    line += "*";\n  }\n  console.log(line);\n}'],
  fizzbuzz: ['for (let i = 1; i <= n; i++) {\n  let text = "";\n  if (i % 3 === 0) text += "Fizz";\n  if (i % 5 === 0) text += "Buzz";\n  console.log(text || i);\n}'],
  'for-count': ['let i = 1;\nwhile (i <= n) {\n  console.log(i);\n  i++;\n}'],
  'count-digits': ['const count = String(n).length;\nconsole.log(count);'],
  'odd-numbers': ['for (let i = 1; i <= n; i += 2) {\n  console.log(i);\n}'],
  'sum-function': [
    'const sum = (a, b) => a + b;',
    'const sum = function (a, b) {\n  return a + b;\n};',
    'function sum(a, b) {\n  console.log("отладка");\n  return a + b;\n}',
  ],
  'max-of-two': ['function maxOf(a, b) {\n  return Math.max(a, b);\n}', 'const maxOf = (a, b) => (a > b ? a : b);'],
  'default-discount': ['const applyDiscount = (price, percent = 10) => (price * (100 - percent)) / 100;'],
  'arrow-is-adult': ['function isAdult(age) {\n  return age >= 18;\n}'],
  'template-string': ['console.log("Меня зовут " + name + ", я живу в городе " + city);'],
  'type-conversion': ['const result = parseInt(text) + 5;\nconsole.log(result);', 'let result = +text;\nresult += 5;\nconsole.log(result);'],
  'is-even': ['console.log(n % 2 == 0 ? true : false);'],
  'logical-and': ['const canEnter = hasTicket && !(age < 18);\nconsole.log(canEnter);'],
};

// Все задания открываем заранее, чтобы проверять их независимо друг от друга.
async function openTask(page: Page, id: string) {
  await page.addInitScript((solved) => {
    localStorage.setItem('jslab.progress.v1', JSON.stringify({ solved, drafts: {} }));
  }, Object.fromEntries(TASKS.map((task) => [task.id, '2026-01-01T00:00:00.000Z'])));
  await page.goto(`/trainer/${id}`);
  await expect(page.locator('.cm-content')).toBeVisible();
}

async function submit(page: Page, code: string): Promise<'passed' | 'failed'> {
  await setCode(page, code);
  await page.getByRole('button', { name: 'Проверить решение' }).click();
  const passed = page.getByRole('heading', { name: 'Верно!' });
  const failed = page.getByRole('heading', { name: 'Пока не получилось' });
  await expect(passed.or(failed)).toBeVisible({ timeout: 20_000 });
  return (await passed.isVisible()) ? 'passed' : 'failed';
}

test('заданий 135, идентификаторы уникальны, данные заполнены', () => {
  expect(TASKS).toHaveLength(135);
  expect(new Set(TASKS.map((task) => task.id)).size).toBe(TASKS.length);
  for (const task of TASKS) {
    expect(task.hints.length, task.id).toBeGreaterThan(0);
    expect(task.explanation.length, task.id).toBeGreaterThan(0);
    expect(WRONG_SOLUTIONS[task.id], `нет неверных решений: ${task.id}`).toBeDefined();
    for (const hint of task.hints) {
      expect(task.solution.includes(hint), `подсказка раскрывает решение: ${task.id}`).toBe(false);
    }
  }
});

for (const task of TASKS) {
  test(`${task.id}: верные решения проходят, неверные и начальный код нет`, async ({ page }) => {
    test.setTimeout(60_000);
    await openTask(page, task.id);

    expect(await submit(page, task.solution), 'эталонное решение').toBe('passed');
    for (const code of OTHER_VALID_SOLUTIONS[task.id] ?? []) {
      expect(await submit(page, code), code).toBe('passed');
    }
    for (const code of [task.initialCode, ...(WRONG_SOLUTIONS[task.id] ?? [])]) {
      expect(await submit(page, code), code).toBe('failed');
    }
  });
}

test('подсказки открываются по одной, решение недоступно сразу после ошибки', async ({ page }) => {
  await openTask(page, 'first-log');
  await expect(page.getByRole('button', { name: 'Показать решение' })).toHaveCount(0);

  await submit(page, 'console.log("нет");');
  await expect(page.getByRole('button', { name: 'Показать решение' })).toHaveCount(0);
  await expect(page.getByText('Ожидалось')).toBeVisible();

  await page.getByRole('button', { name: 'Показать подсказку 1 из 3' }).click();
  await expect(page.getByText('Нужна команда console.log().')).toBeVisible();
  await page.getByRole('button', { name: 'Показать подсказку 2 из 3' }).click();
  await page.getByRole('button', { name: 'Показать подсказку 3 из 3' }).click();
  await expect(page.getByRole('button', { name: 'Показать решение' })).toHaveCount(0);

  await submit(page, 'console.log("нет 2");');
  await submit(page, 'console.log("нет 3");');
  await expect(page.getByRole('button', { name: 'Показать решение' })).toBeVisible();
});

test('бесконечный цикл при проверке не считается решением', async ({ page }) => {
  await openTask(page, 'first-log');
  expect(await submit(page, 'while (true) {}')).toBe('failed');
  await expect(page.getByText('дольше 3 секунд')).toBeVisible();
});

test('бесконечный цикл внутри функции останавливается при проверке', async ({ page }) => {
  await openTask(page, 'sum-function');
  expect(await submit(page, 'function sum(a, b) {\n  while (true) {}\n}')).toBe('failed');
  await expect(page.getByText('дольше 3 секунд')).toBeVisible();
});

test('забытый return объясняется отдельно', async ({ page }) => {
  await openTask(page, 'sum-function');
  expect(await submit(page, 'function sum(a, b) {\n  console.log(a + b);\n}')).toBe('failed');
  await expect(page.getByText('есть ли в функции return')).toBeVisible();
});

test('ненайденная функция и ошибка внутри неё объясняются', async ({ page }) => {
  await openTask(page, 'sum-function');
  expect(await submit(page, 'function add(a, b) {\n  return a + b;\n}')).toBe('failed');
  await expect(page.getByText('Функция sum не найдена')).toBeVisible();

  expect(await submit(page, 'function sum(a, b) {\n  return missing;\n}')).toBe('failed');
  await expect(page.getByText('произошла ошибка')).toBeVisible();
});

test('запуск передаёт программе значения из условия', async ({ page }) => {
  await openTask(page, 'typeof-value');
  await setCode(page, 'console.log(value);');
  await page.getByRole('button', { name: 'Запустить' }).click();
  await expect(page.getByRole('region', { name: 'Консоль' })).toContainText('42');
});
