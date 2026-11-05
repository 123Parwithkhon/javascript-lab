import type { Task } from '../types';

export const module6Tasks: Task[] = [
  {
    id: 'array-last-item',
    moduleId: 6,
    topic: 'индексы',
    level: 'easy',
    title: 'Последний элемент',
    theory:
      'Массив — это упорядоченный список. Нумерация начинается с нуля: list[0] — первый элемент. list.length показывает количество элементов, поэтому индекс последнего на единицу меньше.',
    example: 'const days = ["пн", "вт", "ср"];\nconsole.log(days[0]);     // пн\nconsole.log(days.length); // 3',
    description: 'Напишите функцию lastItem(list), которая возвращает последний элемент массива. Для пустого массива получится undefined.',
    initialCode: 'function lastItem(list) {\n  // Ваш код\n}\n\nconsole.log(lastItem(["а", "б", "в"]));\n',
    cases: [
      {
        label: 'Функция находит последний элемент',
        calls: [
          { name: 'lastItem', args: [[1, 2, 3]], expected: 3 },
          { name: 'lastItem', args: [['а']], expected: 'а' },
          { name: 'lastItem', args: [[]], expected: undefined },
        ],
      },
    ],
    hints: ['Индекс последнего элемента зависит от длины массива.', 'В массиве из 3 элементов последний индекс равен 2.'],
    solution: 'function lastItem(list) {\n  return list[list.length - 1];\n}\n',
    explanation:
      'Индексы начинаются с нуля, поэтому последний равен length - 1. Запись list[list.length] всегда даёт undefined: это одна из самых частых ошибок.',
  },
  {
    id: 'array-sum',
    moduleId: 6,
    topic: 'перебор массива',
    level: 'easy',
    title: 'Сумма чека',
    theory:
      'Цикл for...of перебирает значения массива по очереди. Удобно, когда индекс не нужен.',
    example: 'for (const day of ["пн", "вт"]) {\n  console.log(day);\n}',
    description: 'Напишите функцию sumArray(numbers), которая возвращает сумму чисел массива. Для пустого массива сумма равна 0.',
    initialCode: 'function sumArray(numbers) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция считает сумму',
        calls: [
          { name: 'sumArray', args: [[1, 2, 3]], expected: 6 },
          { name: 'sumArray', args: [[]], expected: 0 },
          { name: 'sumArray', args: [[-1, 1, 10]], expected: 10 },
        ],
      },
    ],
    hints: ['Создайте переменную для суммы до цикла.', 'return должен стоять после цикла, а не внутри него.'],
    solution: 'function sumArray(numbers) {\n  let total = 0;\n  for (const number of numbers) {\n    total += number;\n  }\n  return total;\n}\n',
    explanation:
      'Это тот же приём накопления, что и в модуле про циклы, только значения берутся из массива. Такая схема встречается постоянно: сумма заказа, баллы, статистика.',
  },
  {
    id: 'array-add-item',
    moduleId: 6,
    topic: 'push',
    level: 'easy',
    title: 'Добавить в список',
    theory: 'Метод push добавляет элемент в конец массива, а unshift — в начало. pop удаляет последний элемент, а shift — первый.',
    example: 'const list = ["хлеб"];\nlist.push("чай");\nconsole.log(list); // ["хлеб", "чай"]',
    description: 'Напишите функцию addItem(list, item), которая добавляет item в конец массива и возвращает этот массив.',
    initialCode: 'function addItem(list, item) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция добавляет элемент в конец',
        calls: [
          { name: 'addItem', args: [[1, 2], 3], expected: [1, 2, 3] },
          { name: 'addItem', args: [[], 'чай'], expected: ['чай'] },
        ],
      },
    ],
    hints: ['Понадобится метод push.', 'Сам push возвращает новую длину, а не массив, поэтому верните list отдельно.'],
    solution: 'function addItem(list, item) {\n  list.push(item);\n  return list;\n}\n',
    explanation:
      'push изменяет исходный массив и возвращает его новую длину. Поэтому return list.push(item) вернул бы число, а не список.',
  },
  {
    id: 'array-remove-last',
    moduleId: 6,
    topic: 'pop',
    level: 'easy',
    title: 'Убрать последний',
    theory: 'Метод pop удаляет последний элемент массива и возвращает именно его, а не оставшийся массив.',
    example: 'const list = [1, 2];\nconsole.log(list.pop()); // 2\nconsole.log(list);       // [1]',
    description: 'Напишите функцию removeLast(list), которая удаляет последний элемент и возвращает оставшийся массив.',
    initialCode: 'function removeLast(list) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция убирает последний элемент',
        calls: [
          { name: 'removeLast', args: [[1, 2, 3]], expected: [1, 2] },
          { name: 'removeLast', args: [['а']], expected: [] },
          { name: 'removeLast', args: [[]], expected: [] },
        ],
      },
    ],
    hints: ['Сначала удалите элемент, а потом верните массив.', 'Не возвращайте результат pop напрямую.'],
    solution: 'function removeLast(list) {\n  list.pop();\n  return list;\n}\n',
    explanation: 'Важно знать, что именно возвращает метод: pop отдаёт удалённый элемент, а массив меняет на месте.',
  },
  {
    id: 'array-first-n',
    moduleId: 6,
    topic: 'slice',
    level: 'medium',
    title: 'Первые n элементов',
    theory:
      'slice(start, end) возвращает новую часть массива от start до end, не включая end. Исходный массив не меняется. Если end больше длины, ошибки не будет.',
    example: 'console.log([1, 2, 3, 4].slice(1, 3)); // [2, 3]',
    description: 'Напишите функцию firstN(list, n), которая возвращает первые n элементов массива.',
    initialCode: 'function firstN(list, n) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция возвращает начало массива',
        calls: [
          { name: 'firstN', args: [[1, 2, 3, 4], 2], expected: [1, 2] },
          { name: 'firstN', args: [[1, 2], 0], expected: [] },
          { name: 'firstN', args: [[1], 5], expected: [1] },
        ],
      },
    ],
    hints: ['Начало части — индекс 0.', 'Индекс end в результат не входит, поэтому он равен n.'],
    solution: 'function firstN(list, n) {\n  return list.slice(0, n);\n}\n',
    explanation: 'slice сам справляется с n больше длины массива. Обычный цикл до n потребовал бы отдельной проверки, иначе в результат попали бы undefined.',
  },
  {
    id: 'array-max',
    moduleId: 6,
    topic: 'поиск в цикле',
    level: 'medium',
    title: 'Самое большое число',
    theory: 'Чтобы найти максимум, запоминают лучшего кандидата и сравнивают с ним каждый следующий элемент.',
    description: 'Напишите функцию findMax(numbers), которая возвращает наибольшее число непустого массива.',
    initialCode: 'function findMax(numbers) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция находит максимум',
        calls: [
          { name: 'findMax', args: [[3, 9, 2]], expected: 9 },
          { name: 'findMax', args: [[9, 1]], expected: 9 },
          { name: 'findMax', args: [[7]], expected: 7 },
          { name: 'findMax', args: [[-5, -2, -9]], expected: -2 },
        ],
      },
    ],
    hints: [
      'Подумайте, с чего начать: что будет с массивом из отрицательных чисел, если начать с нуля?',
      'Первым кандидатом удобно взять первый элемент массива.',
    ],
    solution: 'function findMax(numbers) {\n  let max = numbers[0];\n  for (const number of numbers) {\n    if (number > max) {\n      max = number;\n    }\n  }\n  return max;\n}\n',
    explanation:
      'Если начать с нуля, то для [-5, -2, -9] ответ будет 0, хотя такого числа в массиве нет. Поэтому начальное значение берётся из самих данных.',
  },
  {
    id: 'array-map',
    moduleId: 6,
    topic: 'map',
    level: 'medium',
    title: 'Преобразовать всё',
    theory: 'map создаёт новый массив той же длины: каждый элемент заменяется результатом переданной функции.',
    example: 'const squares = [1, 2, 3].map((x) => x * x);\nconsole.log(squares); // [1, 4, 9]',
    description: 'Напишите функцию doubleAll(numbers), которая возвращает новый массив с удвоенными числами.',
    initialCode: 'function doubleAll(numbers) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция удваивает числа',
        calls: [
          { name: 'doubleAll', args: [[1, 2, 3]], expected: [2, 4, 6] },
          { name: 'doubleAll', args: [[]], expected: [] },
          { name: 'doubleAll', args: [[-1, 0]], expected: [-2, 0] },
        ],
      },
    ],
    hints: ['Вызовите map у массива numbers.', 'Функция внутри map получает один элемент и возвращает новое значение.'],
    solution: 'function doubleAll(numbers) {\n  return numbers.map((number) => number * 2);\n}\n',
    explanation: 'map описывает, что сделать с одним элементом, а перебор берёт на себя. Поэтому код короче и в нём меньше мест для ошибки, чем в цикле.',
  },
  {
    id: 'array-filter',
    moduleId: 6,
    topic: 'filter',
    level: 'medium',
    title: 'Только подходящие',
    theory: 'filter создаёт новый массив только из тех элементов, для которых переданная функция вернула true.',
    example: 'const big = [1, 5, 10].filter((x) => x > 3);\nconsole.log(big); // [5, 10]',
    description: 'Напишите функцию onlyAdults(ages), которая возвращает только возрасты от 18 лет.',
    initialCode: 'function onlyAdults(ages) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция оставляет возрасты от 18',
        calls: [
          { name: 'onlyAdults', args: [[17, 18, 30]], expected: [18, 30] },
          { name: 'onlyAdults', args: [[10, 12]], expected: [] },
          { name: 'onlyAdults', args: [[]], expected: [] },
        ],
      },
    ],
    hints: ['Вызовите filter у массива ages.', 'Граница включена: 18 лет подходит.'],
    solution: 'function onlyAdults(ages) {\n  return ages.filter((age) => age >= 18);\n}\n',
    explanation: 'filter не меняет сами элементы, он только решает, какие оставить. Именно так работают фильтры в интернет-магазинах.',
  },
  {
    id: 'array-every',
    moduleId: 6,
    topic: 'some и every',
    level: 'medium',
    title: 'Сдали все?',
    theory:
      'every возвращает true, если условие верно для всех элементов, а some — если хотя бы для одного. find возвращает сам первый подходящий элемент.',
    example: 'console.log([2, 4].every((x) => x % 2 === 0)); // true\nconsole.log([1, 4].some((x) => x > 3));       // true',
    description: 'Напишите функцию allPassed(scores), которая возвращает true, если все оценки не ниже 50.',
    initialCode: 'function allPassed(scores) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция проверяет все оценки',
        calls: [
          { name: 'allPassed', args: [[50, 60, 90]], expected: true },
          { name: 'allPassed', args: [[49, 90]], expected: false },
          { name: 'allPassed', args: [[90, 49]], expected: false },
        ],
      },
    ],
    hints: ['Подойдёт метод every.', 'Оценка 50 считается сданной.'],
    solution: 'function allPassed(scores) {\n  return scores.every((score) => score >= 50);\n}\n',
    explanation: 'every останавливается на первом неподходящем элементе. Читается почти как обычная фраза: «все оценки не ниже 50».',
  },
  {
    id: 'array-reduce',
    moduleId: 6,
    topic: 'reduce',
    level: 'hard',
    title: 'Свернуть в одно значение',
    theory:
      'reduce сворачивает массив в одно значение. Функция получает накопленный результат и текущий элемент и возвращает новый результат. Вторым аргументом задают начальное значение.',
    example: 'const sum = [1, 2, 3].reduce((total, x) => total + x, 0);\nconsole.log(sum); // 6',
    description: 'Напишите функцию multiplyAll(numbers), которая возвращает произведение чисел. Для пустого массива результат равен 1.',
    initialCode: 'function multiplyAll(numbers) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция считает произведение',
        calls: [
          { name: 'multiplyAll', args: [[2, 3, 4]], expected: 24 },
          { name: 'multiplyAll', args: [[5]], expected: 5 },
          { name: 'multiplyAll', args: [[]], expected: 1 },
        ],
      },
    ],
    hints: [
      'В примере накапливается сумма, а здесь нужно умножение.',
      'Подумайте о начальном значении: с нуля произведение всегда будет равно нулю.',
    ],
    solution: 'function multiplyAll(numbers) {\n  return numbers.reduce((result, number) => result * number, 1);\n}\n',
    explanation: 'Начальное значение определяет ответ для пустого массива и старт вычислений. Для суммы это 0, а для произведения 1: такие числа не меняют результат операции.',
  },
  {
    id: 'array-sort',
    moduleId: 6,
    topic: 'сортировка',
    level: 'hard',
    title: 'Коварная сортировка',
    theory:
      'По умолчанию sort сравнивает элементы как строки, поэтому [10, 9, 1].sort() даёт [1, 10, 9]. Для чисел нужна функция сравнения: если она возвращает отрицательное число, первый элемент идёт раньше.',
    example: 'console.log([3, 1, 2].sort((a, b) => b - a)); // [3, 2, 1]',
    description: 'Напишите функцию sortAscending(numbers), которая возвращает числа по возрастанию.',
    initialCode: 'function sortAscending(numbers) {\n  return numbers.sort();\n}\n',
    cases: [
      {
        label: 'Функция сортирует как числа',
        calls: [
          { name: 'sortAscending', args: [[3, 1, 2]], expected: [1, 2, 3] },
          { name: 'sortAscending', args: [[10, 9, 1]], expected: [1, 9, 10] },
          { name: 'sortAscending', args: [[-1, -10, 5]], expected: [-10, -1, 5] },
        ],
      },
    ],
    hints: ['Запустите начальный код на массиве [10, 9, 1] и посмотрите результат.', 'В примере порядок по убыванию. Для возрастания поменяйте a и b местами.'],
    solution: 'function sortAscending(numbers) {\n  return numbers.sort((a, b) => a - b);\n}\n',
    explanation: 'Строка "10" при сравнении идёт раньше "9", потому что сравнение идёт посимвольно. Функция a - b заставляет сортировку сравнивать именно числа.',
  },
];
