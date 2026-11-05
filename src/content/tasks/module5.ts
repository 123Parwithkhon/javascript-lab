import type { Task } from '../types';

const RUN_NOTE = 'Чтобы увидеть результат, вызовите функцию сами: console.log(имя(аргументы)).';

export const module5Tasks: Task[] = [
  {
    id: 'sum-function',
    moduleId: 5,
    topic: 'return',
    level: 'easy',
    title: 'Первая функция',
    theory:
      `Функция — это именованный блок кода, который можно вызывать много раз. Параметры — это её входные данные, а return возвращает результат тому, кто её вызвал. ${RUN_NOTE}`,
    example: 'function double(x) {\n  return x * 2;\n}\n\nconsole.log(double(4)); // 8',
    description: 'Допишите функцию sum, чтобы она возвращала сумму двух чисел.',
    initialCode: 'function sum(a, b) {\n  // Ваш код\n}\n\nconsole.log(sum(2, 3));\n',
    cases: [
      {
        label: 'Функция складывает разные числа',
        calls: [
          { name: 'sum', args: [2, 3], expected: 5 },
          { name: 'sum', args: [-1, 1], expected: 0 },
          { name: 'sum', args: [0, 0], expected: 0 },
          { name: 'sum', args: [0.5, 0.25], expected: 0.75 },
        ],
      },
    ],
    hints: [
      'Результат нужно вернуть, а не вывести в консоль.',
      'Внутри функции понадобится return и знак +.',
    ],
    solution: 'function sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));\n',
    explanation:
      'Платформа сама вызвала функцию с разными аргументами и сравнила возвращённые значения. Поэтому важен именно return: результат можно использовать дальше, например sum(1, 2) * 10.',
  },
  {
    id: 'greet-function',
    moduleId: 5,
    topic: 'параметры',
    level: 'easy',
    title: 'Приветствие',
    theory:
      `Параметр — это имя внутри функции, а аргумент — значение, переданное при вызове. Одна функция работает с любыми аргументами. ${RUN_NOTE}`,
    example: 'function shout(word) {\n  return `${word}!!!`;\n}\n\nconsole.log(shout("Да"));',
    description: 'Напишите функцию greet с параметром name. Она должна возвращать строку вида: Привет, Parviz!',
    initialCode: '// Напишите функцию greet\n',
    cases: [
      {
        label: 'Функция приветствует разных людей',
        calls: [
          { name: 'greet', args: ['Parviz'], expected: 'Привет, Parviz!' },
          { name: 'greet', args: ['Madina'], expected: 'Привет, Madina!' },
        ],
      },
    ],
    hints: [
      'Функция объявляется так: function greet(name) { ... }',
      'Удобнее всего вернуть шаблонную строку с подстановкой ${name}.',
    ],
    solution: 'function greet(name) {\n  return `Привет, ${name}!`;\n}\n',
    explanation:
      'Значение name приходит снаружи при каждом вызове, поэтому функция не привязана к одному человеку.',
  },
  {
    id: 'max-of-two',
    moduleId: 5,
    topic: 'условия в функции',
    level: 'medium',
    title: 'Большее из двух',
    theory:
      `return сразу завершает функцию: код после него не выполняется. В функции можно использовать условия, и у разных веток может быть свой return. ${RUN_NOTE}`,
    description: 'Напишите функцию maxOf, которая возвращает большее из двух чисел. Если числа равны, вернуть нужно любое из них.',
    initialCode: 'function maxOf(a, b) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция находит большее число',
        calls: [
          { name: 'maxOf', args: [3, 7], expected: 7 },
          { name: 'maxOf', args: [7, 3], expected: 7 },
          { name: 'maxOf', args: [5, 5], expected: 5 },
          { name: 'maxOf', args: [-2, -8], expected: -2 },
        ],
      },
    ],
    hints: [
      'Сравните a и b с помощью if.',
      'Функция должна вернуть значение при любом сравнении, в том числе при равенстве чисел.',
    ],
    solution: 'function maxOf(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n',
    explanation:
      'Если первое условие сработало, return завершил функцию. Иначе выполнение дошло до второго return, поэтому else здесь не нужен. Подошёл бы и готовый Math.max(a, b).',
  },
  {
    id: 'default-discount',
    moduleId: 5,
    topic: 'параметры по умолчанию',
    level: 'medium',
    title: 'Скидка по умолчанию',
    theory:
      `Параметру можно задать значение по умолчанию: function f(x = 1). Оно используется, только если аргумент не передан. ${RUN_NOTE}`,
    example: 'function hello(name = "гость") {\n  return `Привет, ${name}`;\n}\n\nconsole.log(hello());',
    description:
      'Напишите функцию applyDiscount(price, percent), которая возвращает цену после скидки. Если percent не передан, скидка равна 10 процентам.',
    initialCode: '// Напишите функцию applyDiscount\n',
    cases: [
      {
        label: 'Функция считает цену со скидкой',
        calls: [
          { name: 'applyDiscount', args: [100], expected: 90 },
          { name: 'applyDiscount', args: [100, 25], expected: 75 },
          { name: 'applyDiscount', args: [200, 0], expected: 200 },
        ],
      },
    ],
    hints: [
      'Скидка в деньгах равна price * percent / 100.',
      'Значение по умолчанию указывается прямо в списке параметров.',
      'Скидка 0 — это тоже переданный аргумент, цена не должна измениться.',
    ],
    solution: 'function applyDiscount(price, percent = 10) {\n  return price - price * percent / 100;\n}\n',
    explanation:
      'Значение по умолчанию срабатывает только при отсутствии аргумента, поэтому скидка 0 работает верно. Запись percent || 10 заменила бы 0 на 10: эту ошибку и ловит третья проверка.',
  },
  {
    id: 'arrow-is-adult',
    moduleId: 5,
    topic: 'стрелочные функции',
    level: 'easy',
    title: 'Стрелочная функция',
    theory:
      `Стрелочная функция — это короткая запись: const f = (x) => x * 2. Если справа от стрелки стоит выражение, его значение возвращается без слова return. ${RUN_NOTE}`,
    example: 'const square = (x) => x * x;\n\nconsole.log(square(3)); // 9',
    description: 'Создайте функцию isAdult, которая возвращает true для возраста от 18 лет и false для меньшего.',
    initialCode: '// Создайте стрелочную функцию isAdult\n',
    cases: [
      {
        label: 'Функция проверяет возраст',
        calls: [
          { name: 'isAdult', args: [30], expected: true },
          { name: 'isAdult', args: [18], expected: true },
          { name: 'isAdult', args: [17], expected: false },
        ],
      },
    ],
    hints: [
      'Начните так: const isAdult = (age) => ...',
      'Сравнение само возвращает true или false, поэтому if не нужен.',
    ],
    solution: 'const isAdult = (age) => age >= 18;\n',
    explanation:
      'Результат сравнения сразу стал результатом функции. Обычное объявление через function работало бы так же: проверка смотрит на поведение, а не на форму записи.',
  },
  {
    id: 'is-prime',
    moduleId: 5,
    topic: 'функции и циклы',
    level: 'hard',
    title: 'Простое число',
    theory:
      `Простое число больше 1 и делится без остатка только на 1 и на само себя. return внутри цикла завершает и цикл, и всю функцию. ${RUN_NOTE}`,
    description: 'Напишите функцию isPrime(n), которая возвращает true, если целое число n простое, и false в остальных случаях.',
    initialCode: 'function isPrime(n) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция распознаёт простые числа',
        calls: [
          { name: 'isPrime', args: [2], expected: true },
          { name: 'isPrime', args: [17], expected: true },
          { name: 'isPrime', args: [9], expected: false },
          { name: 'isPrime', args: [25], expected: false },
          { name: 'isPrime', args: [1], expected: false },
          { name: 'isPrime', args: [0], expected: false },
        ],
      },
    ],
    hints: [
      'Сначала отдельно обработайте числа меньше 2.',
      'Проверьте делители от 2 до n - 1.',
      'Нашли делитель — сразу верните false. Цикл закончился без находок — верните true.',
    ],
    solution:
      'function isPrime(n) {\n  if (n < 2) {\n    return false;\n  }\n  for (let i = 2; i < n; i++) {\n    if (n % i === 0) {\n      return false;\n    }\n  }\n  return true;\n}\n',
    explanation:
      'Функция отвечает false при первом найденном делителе и возвращает true, только если цикл прошёл до конца. Числа 0 и 1 обработаны отдельно: цикл для них не выполнился бы, и ответ был бы неверным.',
  },
];
