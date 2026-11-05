import type { Task } from '../types';

const catchMessage = (call: string) =>
  `(() => { try { ${call}; return "ошибки не было"; } catch (error) { return error.message; } })()`;
const catchName = (call: string) =>
  `(() => { try { ${call}; return "ошибки не было"; } catch (error) { return error.name; } })()`;

export const module11Tasks: Task[] = [
  {
    id: 'error-types',
    moduleId: 11,
    topic: 'типы ошибок',
    level: 'easy',
    title: 'Какая это ошибка',
    theory: 'У частых ошибок есть имена. SyntaxError — код написан неверно. ReferenceError — имя не найдено. TypeError — операция не подходит для значения: например, новое значение для const или вызов того, что не является функцией.',
    description: 'Программа падает с TypeError. Прочитайте сообщение и исправьте код, чтобы он вывел 2.',
    initialCode: 'const count = 1;\ncount = count + 1;\nconsole.log(count);\n',
    cases: [{ label: 'Программа выводит 2', output: ['2'] }],
    hints: ['Сообщение говорит о присваивании значения константе.', 'Этой переменной нужно менять значение, поэтому выберите другое ключевое слово.'],
    solution: 'let count = 1;\ncount = count + 1;\nconsole.log(count);\n',
    explanation: 'Имя ошибки сразу подсказывает, где искать. TypeError здесь защищал переменную от изменения, а настоящая причина — неподходящее ключевое слово.',
  },
  {
    id: 'try-catch-parse',
    moduleId: 11,
    topic: 'try...catch',
    level: 'medium',
    title: 'Ненадёжные данные',
    theory: 'try выполняет код, а если в нём возникла ошибка, управление переходит в catch, и программа продолжает работу. JSON.parse превращает текст в объект и выбрасывает ошибку, если текст неверный.',
    example: 'try {\n  JSON.parse("не json");\n} catch (error) {\n  console.log(error.name); // SyntaxError\n}',
    description: 'Напишите функцию safeParse(text), которая возвращает объект из JSON-текста, а при неверном тексте возвращает null.',
    initialCode: 'function safeParse(text) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция не падает на неверных данных',
        calls: [
          { name: 'safeParse', args: ['{"name":"Parviz"}'], expected: { name: 'Parviz' } },
          { name: 'safeParse', args: ['[1,2]'], expected: [1, 2] },
          { name: 'safeParse', args: ['это не json'], expected: null },
          { name: 'safeParse', args: [''], expected: null },
        ],
      },
    ],
    hints: ['Вызов JSON.parse поместите в блок try.', 'В блоке catch верните null.'],
    solution: 'function safeParse(text) {\n  try {\n    return JSON.parse(text);\n  } catch {\n    return null;\n  }\n}\n',
    explanation: 'Данные извне могут быть какими угодно, поэтому такая защита нужна. Без неё одна испорченная строка обрушила бы всю программу.',
  },
  {
    id: 'throw-divide',
    moduleId: 11,
    topic: 'throw',
    level: 'medium',
    title: 'Своя ошибка',
    theory: 'throw сообщает об ошибке и сразу завершает функцию. Обычно выбрасывают new Error("понятное сообщение"). Это лучше, чем молча вернуть неверный результат.',
    example: 'function checkName(name) {\n  if (name === "") {\n    throw new Error("Имя не указано");\n  }\n  return name;\n}',
    description: 'Напишите функцию divide(a, b), которая возвращает a / b. Если b равно 0, функция должна выбросить ошибку с сообщением «Деление на ноль».',
    initialCode: 'function divide(a, b) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция сообщает о делении на ноль',
        checks: [
          { label: 'divide(10, 2)', expression: 'divide(10, 2)', expected: 5 },
          { label: 'divide(0, 5)', expression: 'divide(0, 5)', expected: 0 },
          { label: 'сообщение ошибки divide(1, 0)', expression: catchMessage('divide(1, 0)'), expected: 'Деление на ноль' },
        ],
      },
    ],
    hints: ['Сначала проверьте b через if.', 'Ошибка создаётся так: throw new Error("текст").'],
    solution: 'function divide(a, b) {\n  if (b === 0) {\n    throw new Error("Деление на ноль");\n  }\n  return a / b;\n}\n',
    explanation: 'Без проверки 1 / 0 дало бы Infinity, и программа продолжила бы считать с неверным значением. Лучше сразу сообщить о проблеме там, где она возникла.',
  },
  {
    id: 'finally-steps',
    moduleId: 11,
    topic: 'finally',
    level: 'medium',
    title: 'Выполнится в любом случае',
    theory: 'Блок finally выполняется всегда: и после успеха, и после ошибки. Обычно он нужен для завершающих действий, например скрыть индикатор загрузки.',
    example: 'try {\n  console.log("работаем");\n} finally {\n  console.log("завершили");\n}',
    description: 'Допишите функцию process(shouldFail). Если shouldFail равно true, код в try выбрасывает ошибку. Функция должна вернуть журнал шагов: при успехе ["старт", "успех", "конец"], при ошибке ["старт", "ошибка", "конец"].',
    initialCode: 'function process(shouldFail) {\n  const log = ["старт"];\n\n  // Ваш код\n\n  return log;\n}\n',
    cases: [
      {
        label: 'Завершающий шаг выполняется всегда',
        calls: [
          { name: 'process', args: [false], expected: ['старт', 'успех', 'конец'] },
          { name: 'process', args: [true], expected: ['старт', 'ошибка', 'конец'] },
        ],
      },
    ],
    hints: ['Понадобятся все три блока: try, catch и finally.', 'Сначала в try проверьте shouldFail, а после этого добавьте шаг «успех».'],
    solution: 'function process(shouldFail) {\n  const log = ["старт"];\n\n  try {\n    if (shouldFail) {\n      throw new Error("Сбой");\n    }\n    log.push("успех");\n  } catch {\n    log.push("ошибка");\n  } finally {\n    log.push("конец");\n  }\n\n  return log;\n}\n',
    explanation: 'throw сразу перешёл в catch и пропустил шаг «успех», а finally сработал в обоих случаях. Завершающее действие не приходится дублировать в двух местах.',
  },
  {
    id: 'validate-age',
    moduleId: 11,
    topic: 'типы своих ошибок',
    level: 'hard',
    title: 'Проверка данных',
    theory: 'Можно выбрасывать разные типы ошибок: TypeError, если значение не того типа, и RangeError, если оно вне допустимых границ. Так вызывающий код может понять, что именно пошло не так, через error.name.',
    example: 'try {\n  throw new RangeError("Слишком много");\n} catch (error) {\n  console.log(error.name); // RangeError\n}',
    description: 'Напишите функцию validateAge(age). Если age не число, выбросите TypeError. Если age меньше 0 или больше 150, выбросите RangeError. Иначе верните age.',
    initialCode: 'function validateAge(age) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Функция различает виды ошибок',
        checks: [
          { label: 'validateAge(20)', expression: 'validateAge(20)', expected: 20 },
          { label: 'граница validateAge(0)', expression: 'validateAge(0)', expected: 0 },
          { label: 'граница validateAge(150)', expression: 'validateAge(150)', expected: 150 },
          { label: 'тип ошибки для "20"', expression: catchName('validateAge("20")'), expected: 'TypeError' },
          { label: 'тип ошибки для -1', expression: catchName('validateAge(-1)'), expected: 'RangeError' },
          { label: 'тип ошибки для 151', expression: catchName('validateAge(151)'), expected: 'RangeError' },
        ],
      },
    ],
    hints: ['Тип значения поможет проверить оператор typeof.', 'Сначала проверьте тип, а потом границы.', '0 и 150 допустимы.'],
    solution: 'function validateAge(age) {\n  if (typeof age !== "number") {\n    throw new TypeError("Возраст должен быть числом");\n  }\n  if (age < 0 || age > 150) {\n    throw new RangeError("Недопустимый возраст");\n  }\n  return age;\n}\n',
    explanation: 'Строка "20" при сравнении с числами прошла бы проверку границ, поэтому тип проверяется первым. Точный тип ошибки позволяет показать пользователю понятное сообщение.',
  },
  {
    id: 'run-safely',
    moduleId: 11,
    topic: 'обработка ошибок',
    level: 'hard',
    title: 'Надёжная обёртка',
    theory: 'Функцию можно передать как аргумент другой функции. Это позволяет написать одну общую обёртку, которая перехватывает ошибки любой переданной функции.',
    example: 'function twice(action) {\n  action();\n  action();\n}\n\ntwice(() => console.log("Шаг"));',
    description: 'Напишите функцию runSafely(action). Она вызывает action и возвращает { ok: true, value: результат }. Если возникла ошибка, она возвращает { ok: false, error: сообщение ошибки }.',
    initialCode: 'function runSafely(action) {\n  // Ваш код\n}\n',
    cases: [
      {
        label: 'Обёртка перехватывает ошибки',
        checks: [
          { label: 'успешная функция', expression: 'runSafely(() => 42)', expected: { ok: true, value: 42 } },
          { label: 'успешный результат 0', expression: 'runSafely(() => 0)', expected: { ok: true, value: 0 } },
          {
            label: 'функция с ошибкой',
            expression: 'runSafely(() => { throw new Error("Сбой"); })',
            expected: { ok: false, error: 'Сбой' },
          },
          {
            label: 'настоящая ошибка JavaScript',
            expression: 'runSafely(() => null.x).ok',
            expected: false,
          },
        ],
      },
    ],
    hints: ['Вызов action() поместите в try.', 'Сообщение ошибки находится в error.message.'],
    solution: 'function runSafely(action) {\n  try {\n    return { ok: true, value: action() };\n  } catch (error) {\n    return { ok: false, error: error.message };\n  }\n}\n',
    explanation: 'Теперь ошибка стала обычным значением, которое можно проверить через ok. Такой приём часто используют при загрузке данных из сети, а это ваш следующий большой шаг.',
  },
];
