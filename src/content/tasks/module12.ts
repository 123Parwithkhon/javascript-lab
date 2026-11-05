import type { Task } from '../types';

/**
 * Настоящая сеть в песочнице запрещена, поэтому fetch здесь учебный: он работает
 * с тем же синтаксисом, но отвечает заранее заданными данными.
 */
export const LAB_SETUP = `
const LAB_DATA = {
  '/users/1': { id: 1, name: 'Parviz', city: 'Душанбе' },
  '/users/2': { id: 2, name: 'Madina', city: 'Худжанд' },
  '/products': [
    { title: 'чай', price: 5 },
    { title: 'мёд', price: 40 },
    { title: 'хлеб', price: 3 },
  ],
};
self.fetch = (url) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (String(url).startsWith('/offline')) {
        reject(new TypeError('Failed to fetch'));
        return;
      }
      const data = LAB_DATA[url];
      resolve({
        ok: data !== undefined,
        status: data !== undefined ? 200 : 404,
        json: async () => data,
      });
    }, 5);
  });
`;

const FETCH_NOTE = 'В лаборатории fetch учебный: он отвечает заранее заданными данными по адресам /users/1, /users/2 и /products.';

export const module12Tasks: Task[] = [
  {
    id: 'async-order',
    moduleId: 12,
    topic: 'синхронный и асинхронный код',
    level: 'easy',
    title: 'Что выведется раньше',
    theory: 'Обычный код выполняется строка за строкой. setTimeout откладывает функцию на потом, а программа идёт дальше, не дожидаясь её. Отложенная функция выполнится только после всего текущего кода, даже с задержкой 0.',
    example: 'setTimeout(() => console.log("Потом"), 0);\nconsole.log("Сразу");',
    description: 'Сделайте так, чтобы программа вывела: «Заказ принят», затем «Готовим», а «Заказ готов» выводилось через setTimeout с задержкой 10 миллисекунд, последним.',
    initialCode: 'console.log("Заказ принят");\n\n// Отложите следующую строку с помощью setTimeout\nconsole.log("Заказ готов");\n\nconsole.log("Готовим");\n',
    cases: [{ label: 'Порядок вывода', output: ['Заказ принят', 'Готовим', 'Заказ готов'] }],
    hints: ['setTimeout получает функцию и задержку в миллисекундах.', 'Строку «Готовим» двигать не нужно: отложенный код выполнится позже неё.'],
    solution: 'console.log("Заказ принят");\n\nsetTimeout(() => {\n  console.log("Заказ готов");\n}, 10);\n\nconsole.log("Готовим");\n',
    explanation: 'Код не ждёт таймер. Именно так браузер остаётся отзывчивым, пока идёт долгая операция.',
  },
  {
    id: 'async-callback',
    moduleId: 12,
    topic: 'callback',
    level: 'medium',
    title: 'Функция обратного вызова',
    theory: 'Callback — это функция, которую передают другой функции, чтобы та вызвала её, когда результат будет готов. Вернуть результат отложенной операции через return нельзя: функция уже завершится.',
    example: 'function later(callback) {\n  setTimeout(() => callback("Готово"), 5);\n}\n\nlater((text) => console.log(text));',
    description: 'Напишите функцию delayedSum(a, b, callback). Через setTimeout с задержкой 5 миллисекунд она должна вызвать callback с суммой a и b.',
    initialCode: 'function delayedSum(a, b, callback) {\n  // Ваш код\n}\n\ndelayedSum(2, 3, (sum) => console.log(sum));\n',
    cases: [
      {
        label: 'Функция отдаёт результат через callback',
        checks: [
          { label: 'delayedSum(2, 3, ...)', expression: 'new Promise((done) => delayedSum(2, 3, done))', expected: 5 },
          { label: 'delayedSum(-1, 1, ...)', expression: 'new Promise((done) => delayedSum(-1, 1, done))', expected: 0 },
          {
            label: 'callback вызывается не сразу, а позже',
            expression: '(() => { let sync = true; let calledSync; delayedSum(1, 1, () => { calledSync = sync; }); sync = false; return new Promise((done) => setTimeout(() => done(calledSync), 30)); })()',
            expected: false,
          },
        ],
      },
    ],
    hints: ['Внутри setTimeout вызовите callback.', 'Сумму нужно передать как аргумент callback, а не вернуть через return.'],
    solution: 'function delayedSum(a, b, callback) {\n  setTimeout(() => {\n    callback(a + b);\n  }, 5);\n}\n',
    explanation: 'Функция завершается сразу, а результат приходит позже через callback. Если вложить много таких вызовов друг в друга, код станет трудно читать: поэтому появились промисы.',
  },
  {
    id: 'promise-create',
    moduleId: 12,
    topic: 'Promise',
    level: 'medium',
    title: 'Свой промис',
    theory: 'Promise — это объект, представляющий будущий результат. Функция внутри new Promise получает resolve: его вызывают, когда результат готов. Значение затем получают через then.',
    example: 'const promise = new Promise((resolve) => {\n  setTimeout(() => resolve("Готово"), 5);\n});\n\npromise.then((value) => console.log(value));',
    description: 'Напишите функцию wait(ms, value), которая возвращает промис. Через ms миллисекунд он должен выполниться со значением value.',
    initialCode: 'function wait(ms, value) {\n  // Ваш код\n}\n\nwait(5, "Готово").then((value) => console.log(value));\n',
    cases: [
      {
        label: 'Функция возвращает промис со значением',
        checks: [
          { label: 'wait возвращает Promise', expression: 'wait(1, 0) instanceof Promise', expected: true },
          { label: 'wait(1, "чай")', expression: 'wait(1, "чай")', expected: 'чай' },
          { label: 'wait(1, 0)', expression: 'wait(1, 0)', expected: 0 },
          {
            label: 'значение приходит с задержкой',
            expression: '(() => { const start = Date.now(); return wait(30, 1).then(() => Date.now() - start >= 20); })()',
            expected: true,
          },
        ],
      },
    ],
    hints: ['Начните с return new Promise((resolve) => { ... }).', 'Внутри используйте setTimeout и вызовите в нём resolve(value).'],
    solution: 'function wait(ms, value) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(value), ms);\n  });\n}\n',
    explanation: 'Промис превратил таймер в значение, которое можно передавать и объединять. На этом строится весь современный асинхронный JavaScript.',
  },
  {
    id: 'fetch-then',
    moduleId: 12,
    topic: 'then и fetch',
    level: 'medium',
    title: 'Загрузка данных',
    setup: LAB_SETUP,
    theory: `fetch(адрес) возвращает промис с ответом сервера. Метод json() тоже возвращает промис, поэтому then выстраивают цепочкой. ${FETCH_NOTE}`,
    example: 'fetch("/users/1")\n  .then((response) => response.json())\n  .then((user) => console.log(user));',
    description: 'Напишите функцию getName(id), которая загружает /users/ID и возвращает промис с именем пользователя. Используйте then.',
    initialCode: 'function getName(id) {\n  // Ваш код\n}\n\ngetName(1).then((name) => console.log(name));\n',
    cases: [
      {
        label: 'Функция загружает имя',
        checks: [
          { label: 'getName(1)', expression: 'getName(1)', expected: 'Parviz' },
          { label: 'getName(2)', expression: 'getName(2)', expected: 'Madina' },
        ],
      },
    ],
    hints: ['Адрес удобно собрать шаблонной строкой.', 'Не забудьте return перед fetch, иначе функция ничего не вернёт.', 'Понадобятся два then: один для json(), другой для имени.'],
    solution: 'function getName(id) {\n  return fetch(`/users/${id}`)\n    .then((response) => response.json())\n    .then((user) => user.name);\n}\n',
    explanation: 'Каждый then получает результат предыдущего шага. Этот же код с настоящим адресом работает на реальных сайтах.',
  },
  {
    id: 'async-await',
    moduleId: 12,
    topic: 'async и await',
    level: 'medium',
    title: 'async и await',
    setup: LAB_SETUP,
    theory: `await приостанавливает функцию, пока промис не выполнится, и возвращает его значение. Использовать await можно внутри функции с пометкой async. Такая функция всегда возвращает промис. ${FETCH_NOTE}`,
    example: 'async function load() {\n  const response = await fetch("/users/1");\n  return response.json();\n}',
    description: 'Напишите асинхронную функцию getCity(id), которая возвращает город пользователя.',
    initialCode: '// Напишите функцию getCity\n',
    cases: [
      {
        label: 'Функция загружает город',
        checks: [
          { label: 'getCity(1)', expression: 'getCity(1)', expected: 'Душанбе' },
          { label: 'getCity(2)', expression: 'getCity(2)', expected: 'Худжанд' },
          { label: 'getCity возвращает Promise', expression: 'getCity(1) instanceof Promise', expected: true },
        ],
      },
    ],
    hints: ['await нужен дважды: для fetch и для json().', 'Без await в user окажется промис, а не объект.'],
    solution: 'async function getCity(id) {\n  const response = await fetch(`/users/${id}`);\n  const user = await response.json();\n  return user.city;\n}\n',
    explanation: 'Логика та же, что и в цепочке then, но код читается сверху вниз, как обычный. Поэтому сегодня чаще пишут именно так.',
  },
  {
    id: 'async-errors',
    moduleId: 12,
    topic: 'ошибки в асинхронном коде',
    level: 'hard',
    title: 'Сервер не ответил',
    setup: LAB_SETUP,
    theory: `В async-функции ошибки промисов ловит обычный try...catch. Важная особенность: fetch не считает ответ 404 ошибкой, поэтому нужно проверять response.ok. ${FETCH_NOTE} Адрес /offline имитирует отсутствие сети.`,
    example: 'try {\n  const response = await fetch("/offline");\n} catch (error) {\n  console.log("Нет сети");\n}',
    description: 'Напишите асинхронную функцию safeLoad(url). Она возвращает данные ответа, а если сервер ответил ошибкой или сети нет, возвращает null.',
    initialCode: 'async function safeLoad(url) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция справляется со всеми исходами',
        checks: [
          { label: 'успешный ответ /users/1', expression: 'safeLoad("/users/1")', expected: { id: 1, name: 'Parviz', city: 'Душанбе' } },
          { label: 'ответ 404 на /users/99', expression: 'safeLoad("/users/99")', expected: null },
          { label: 'нет сети: /offline', expression: 'safeLoad("/offline")', expected: null },
        ],
      },
    ],
    hints: ['Сетевую ошибку поймает try...catch.', 'Ответ 404 не вызывает ошибку: проверьте response.ok отдельно.', 'Не забудьте await внутри try, иначе ошибка промиса пройдёт мимо catch.'],
    solution: 'async function safeLoad(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      return null;\n    }\n    return await response.json();\n  } catch {\n    return null;\n  }\n}\n',
    explanation: 'Здесь два разных вида сбоя: сеть недоступна и сервер ответил ошибкой. Новички часто обрабатывают только первый и не замечают второй.',
  },
  {
    id: 'async-total',
    moduleId: 12,
    topic: 'работа с API',
    level: 'hard',
    title: 'Итог по каталогу',
    setup: LAB_SETUP,
    theory: `Настоящая задача обычно выглядит так: загрузить данные, а затем обработать их уже знакомыми методами массивов. ${FETCH_NOTE}`,
    description: 'Напишите асинхронную функцию catalogSummary(maxPrice). Она загружает /products и возвращает объект { count, total }: количество товаров с ценой не выше maxPrice и сумму их цен.',
    initialCode: 'async function catalogSummary(maxPrice) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция обрабатывает загруженные данные',
        checks: [
          { label: 'catalogSummary(5)', expression: 'catalogSummary(5)', expected: { count: 2, total: 8 } },
          { label: 'catalogSummary(100)', expression: 'catalogSummary(100)', expected: { count: 3, total: 48 } },
          { label: 'catalogSummary(1)', expression: 'catalogSummary(1)', expected: { count: 0, total: 0 } },
        ],
      },
    ],
    hints: ['Сначала получите массив товаров, как в прошлых заданиях.', 'Отберите подходящие через filter, а сумму посчитайте через reduce.'],
    solution: 'async function catalogSummary(maxPrice) {\n  const response = await fetch("/products");\n  const products = await response.json();\n  const matching = products.filter((product) => product.price <= maxPrice);\n  return {\n    count: matching.length,\n    total: matching.reduce((sum, product) => sum + product.price, 0),\n  };\n}\n',
    explanation: 'Вы соединили асинхронность, массивы и объекты. Этого достаточно, чтобы начать делать приложения, работающие с настоящими данными.',
  },
];
