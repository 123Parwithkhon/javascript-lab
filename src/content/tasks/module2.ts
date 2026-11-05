import type { Task } from '../types';

export const module2Tasks: Task[] = [
  {
    id: 'order-total',
    moduleId: 2,
    topic: 'арифметика',
    level: 'easy',
    title: 'Сумма покупки',
    theory:
      'Для вычислений используются + - * /. Результат можно сохранить в переменную и использовать дальше.',
    example: 'const area = 4 * 5;\nconsole.log(area); // 20',
    description:
      'Переменные price и quantity содержат цену и количество товара. Создайте переменную total со стоимостью покупки и выведите её.',
    initialCode: '// Переменные price и quantity уже существуют\n',
    cases: [
      {
        label: 'price = 25, quantity = 3',
        givens: { price: 25, quantity: 3 },
        output: ['75'],
        variables: { total: 75 },
      },
      {
        label: 'price = 10, quantity = 0',
        givens: { price: 10, quantity: 0 },
        output: ['0'],
        variables: { total: 0 },
      },
    ],
    hints: ['Стоимость — это цена, умноженная на количество.', 'Умножение обозначается знаком *.'],
    solution: 'const total = price * quantity;\nconsole.log(total);\n',
    explanation:
      'Программа считает по формуле, а не хранит готовый ответ, поэтому работает для любого заказа, в том числе пустого.',
  },
  {
    id: 'is-even',
    moduleId: 2,
    topic: 'остаток от деления',
    level: 'medium',
    title: 'Чётное число',
    theory:
      'Оператор % возвращает остаток от деления: 7 % 2 равно 1. Сравнение === возвращает true или false.',
    example: 'console.log(7 % 2);       // 1\nconsole.log(7 % 2 === 1); // true',
    description: 'Переменная n содержит целое число. Выведите true, если оно чётное, и false, если нечётное.',
    initialCode: '// Переменная n уже существует\n',
    cases: [
      { label: 'n = 4', givens: { n: 4 }, output: ['true'] },
      { label: 'n = 7', givens: { n: 7 }, output: ['false'] },
      { label: 'n = 0', givens: { n: 0 }, output: ['true'] },
      { label: 'n = -3', givens: { n: -3 }, output: ['false'] },
    ],
    hints: [
      'Чётное число делится на 2 без остатка.',
      'Сравните остаток от деления n на 2 с нулём.',
      'Сравнение уже даёт true или false, условие здесь не нужно.',
    ],
    solution: 'console.log(n % 2 === 0);\n',
    explanation:
      'У чётного числа остаток от деления на 2 равен нулю. Проверка на n % 2 === 1 ошиблась бы на -3: там остаток равен -1. Поэтому граничные значения важно проверять.',
  },
  {
    id: 'strict-equality',
    moduleId: 2,
    topic: '=== и ==',
    level: 'medium',
    title: 'Строгое сравнение',
    theory:
      'Оператор == перед сравнением преобразует типы, поэтому 5 == "5" даёт true. Оператор === сравнивает и значение, и тип, поэтому 5 === "5" даёт false. В большинстве случаев нужен ===.',
    description: 'Выведите true, только если a и b равны и по значению, и по типу.',
    initialCode: '// Переменные a и b уже существуют\nconsole.log(a == b);\n',
    cases: [
      { label: 'a = 5, b = 5', givens: { a: 5, b: 5 }, output: ['true'] },
      { label: 'a = 5, b = "5"', givens: { a: 5, b: '5' }, output: ['false'] },
      { label: 'a = 0, b = false', givens: { a: 0, b: false }, output: ['false'] },
      { label: 'a = "да", b = "да"', givens: { a: 'да', b: 'да' }, output: ['true'] },
    ],
    hints: ['Не хватает только одного символа.', 'Замените == на ===.'],
    solution: 'console.log(a === b);\n',
    explanation:
      '=== не преобразует типы, поэтому 0 и false для него разные значения. Это избавляет от неожиданных результатов.',
  },
  {
    id: 'logical-and',
    moduleId: 2,
    topic: 'логические операторы',
    level: 'hard',
    title: 'Можно ли войти',
    theory:
      'Оператор && даёт true, только если верны оба условия. Оператор || — если верно хотя бы одно. Оператор ! заменяет true на false и наоборот.',
    example: 'const sunny = true;\nconst warm = false;\nconsole.log(sunny && warm); // false',
    description:
      'На мероприятие пускают с 18 лет и только с билетом. Создайте переменную canEnter с результатом проверки и выведите её. Даны age и hasTicket.',
    initialCode: '// Переменные age и hasTicket уже существуют\n',
    cases: [
      {
        label: 'age = 20, hasTicket = true',
        givens: { age: 20, hasTicket: true },
        output: ['true'],
        variables: { canEnter: true },
      },
      {
        label: 'age = 18, hasTicket = true (ровно 18 лет)',
        givens: { age: 18, hasTicket: true },
        output: ['true'],
        variables: { canEnter: true },
      },
      {
        label: 'age = 17, hasTicket = true',
        givens: { age: 17, hasTicket: true },
        output: ['false'],
        variables: { canEnter: false },
      },
      {
        label: 'age = 30, hasTicket = false',
        givens: { age: 30, hasTicket: false },
        output: ['false'],
        variables: { canEnter: false },
      },
    ],
    hints: [
      'Здесь два условия, и оба должны выполняться.',
      '«С 18 лет» включает и сам возраст 18, поэтому нужен >=.',
    ],
    solution: 'const canEnter = age >= 18 && hasTicket;\nconsole.log(canEnter);\n',
    explanation:
      'Сравнение и переменная hasTicket дают логические значения, а && объединяет их. Чаще всего здесь ошибаются на границе: при > вместо >= человека с 18 годами не пустят.',
  },
];
