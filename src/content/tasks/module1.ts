import type { Task } from '../types';

export const module1Tasks: Task[] = [
  {
    id: 'first-variable',
    moduleId: 1,
    topic: 'const',
    level: 'easy',
    title: 'Первая переменная',
    theory:
      'Переменная — это имя, под которым программа хранит значение. Ключевое слово const создаёт переменную, которой нельзя присвоить новое значение.',
    example: 'const city = "Душанбе";\nconsole.log(city);',
    description: 'Создайте переменную name со значением Parviz и выведите её в консоль.',
    initialCode: '// Создайте переменную здесь\n',
    cases: [
      {
        label: 'Переменная name равна Parviz и выведена в консоль',
        output: ['Parviz'],
        variables: { name: 'Parviz' },
      },
    ],
    hints: [
      'Переменная создаётся так: const имя = значение;',
      'Parviz — это текст, поэтому ему нужны кавычки.',
      'В console.log() передайте имя переменной без кавычек.',
    ],
    solution: 'const name = "Parviz";\nconsole.log(name);\n',
    explanation:
      'Значение сохранилось под именем name. console.log(name) выводит содержимое переменной, а console.log("name") вывел бы само слово name.',
  },
  {
    id: 'let-change',
    moduleId: 1,
    topic: 'let',
    level: 'easy',
    title: 'Значение, которое меняется',
    theory:
      'Если значение будет меняться, используйте let. После создания переменной let пишут только имя и новое значение. Используйте const по умолчанию, а let — когда это действительно нужно.',
    example: 'let lives = 3;\nlives = 2;\nconsole.log(lives);',
    description: 'Игрок набрал очки. Присвойте переменной score значение 15 и выведите её в консоль. Первую строку не меняйте.',
    initialCode: 'let score = 10;\n\n// Измените score и выведите её значение\n',
    cases: [
      {
        label: 'score равна 15 и выведена в консоль',
        output: ['15'],
        variables: { score: 15 },
      },
    ],
    hints: [
      'При новом присваивании слово let писать не нужно.',
      'Новое значение присваивается через знак =.',
    ],
    solution: 'let score = 10;\n\nscore = 15;\nconsole.log(score);\n',
    explanation:
      'let разрешает присвоить новое значение. С const та же программа завершилась бы ошибкой TypeError: так JavaScript защищает значения, которые не должны меняться.',
  },
  {
    id: 'typeof-value',
    moduleId: 1,
    topic: 'типы данных',
    level: 'easy',
    title: 'Какой это тип?',
    theory:
      'У каждого значения есть тип: "Текст" — string, 42 — number, true и false — boolean. Оператор typeof возвращает тип значения в виде строки.',
    example: 'console.log(typeof 42); // number',
    description: 'Платформа передаёт программе переменную value. Выведите в консоль её тип.',
    initialCode: '// Переменная value уже существует, создавать её не нужно\n',
    cases: [
      { label: 'value = 42', givens: { value: 42 }, output: ['number'] },
      { label: 'value = "42"', givens: { value: '42' }, output: ['string'] },
      { label: 'value = true', givens: { value: true }, output: ['boolean'] },
    ],
    hints: [
      'Понадобятся typeof и console.log().',
      'Значение value заранее неизвестно, поэтому ответ нельзя написать вручную.',
    ],
    solution: 'console.log(typeof value);\n',
    explanation:
      '42 и "42" выглядят похоже, но это разные типы: с числом можно считать, а строка — это текст. typeof помогает это проверить.',
  },
  {
    id: 'template-string',
    moduleId: 1,
    topic: 'шаблонные строки',
    level: 'medium',
    title: 'Шаблонная строка',
    theory:
      'Шаблонная строка записывается в обратных кавычках `. Внутри неё можно подставить значение переменной с помощью ${имя}.',
    example: 'const day = "пятница";\nconsole.log(`Сегодня ${day}`);',
    description:
      'Платформа передаёт переменные name и city. Выведите строку вида: Меня зовут Parviz, я живу в городе Душанбе',
    initialCode: '// Переменные name и city уже существуют\n',
    cases: [
      {
        label: 'name = "Parviz", city = "Душанбе"',
        givens: { name: 'Parviz', city: 'Душанбе' },
        output: ['Меня зовут Parviz, я живу в городе Душанбе'],
      },
      {
        label: 'name = "Madina", city = "Худжанд"',
        givens: { name: 'Madina', city: 'Худжанд' },
        output: ['Меня зовут Madina, я живу в городе Худжанд'],
      },
    ],
    hints: [
      'Обратная кавычка на клавиатуре обычно находится слева от цифры 1.',
      'Подстановка записывается как ${name}.',
      'Текст проверяется целиком, включая запятую и пробелы.',
    ],
    solution: 'console.log(`Меня зовут ${name}, я живу в городе ${city}`);\n',
    explanation:
      'Шаблонная строка подставила текущие значения переменных, поэтому одна программа подошла для разных людей. Можно решить и через знак +, но шаблон обычно читается легче.',
  },
  {
    id: 'type-conversion',
    moduleId: 1,
    topic: 'преобразование типов',
    level: 'medium',
    title: 'Текст в число',
    theory:
      'Данные из форм приходят как текст. Знак + для строк склеивает их: "25" + 5 даст "255". Чтобы считать, преобразуйте строку в число: Number("25").',
    description:
      'Переменная text содержит число в виде строки. Создайте переменную result, равную этому числу плюс 5, и выведите её.',
    initialCode: '// Переменная text уже существует\n',
    cases: [
      {
        label: 'text = "25"',
        givens: { text: '25' },
        output: ['30'],
        variables: { result: 30 },
      },
      {
        label: 'text = "7"',
        givens: { text: '7' },
        output: ['12'],
        variables: { result: 12 },
      },
      {
        label: 'text = "0"',
        givens: { text: '0' },
        output: ['5'],
        variables: { result: 5 },
      },
    ],
    hints: [
      'Если получилось 255, значит, строки склеились.',
      'Сначала преобразуйте text с помощью Number(), а затем прибавьте 5.',
    ],
    solution: 'const result = Number(text) + 5;\nconsole.log(result);\n',
    explanation:
      'Number(text) сначала превратил строку в число, поэтому + сработал как сложение. Это одна из самых частых ошибок новичков при работе с формами.',
  },
];
