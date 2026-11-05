export interface LessonQuiz {
  code: string;
  /** Варианты вывода. Строки вывода программы разделены пробелом. */
  options: string[];
  answer: number;
  why: string;
}

/** «Предскажи результат» по адресу урока. Тесты запускают код и сверяют правильный ответ. */
export const QUIZZES: Record<string, LessonQuiz> = {
  'first-program': {
    code: 'console.log("А");\n// console.log("Б");\nconsole.log("В");',
    options: ['А Б В', 'А В', 'Б', 'В А'],
    answer: 1,
    why: 'Строка с // — это комментарий, поэтому она не выполняется. Остальные идут сверху вниз.',
  },
  variables: {
    code: 'const a = "2";\nconst b = 3;\nconsole.log(a + b);',
    options: ['5', '23', 'ошибка', 'undefined'],
    answer: 1,
    why: 'Одна из сторон — строка, поэтому + склеивает, а не складывает.',
  },
  operators: {
    code: 'console.log(7 % 3 === 1 && !false);',
    options: ['true', 'false', '1', '2'],
    answer: 0,
    why: 'Остаток от деления 7 на 3 равен 1, поэтому сравнение верно. !false даёт true, значит, верны обе части.',
  },
  conditions: {
    code: 'const score = 95;\n\nif (score >= 50) {\n  console.log("Сдал");\n} else if (score >= 90) {\n  console.log("Отлично");\n}',
    options: ['Отлично', 'Сдал', 'Сдал Отлично', 'ничего'],
    answer: 1,
    why: 'Выполняется только первая подходящая ветка. 95 подходит уже под score >= 50, и до второй проверки дело не доходит.',
  },
  loops: {
    code: 'for (let i = 0; i < 3; i++) {\n  if (i === 1) {\n    continue;\n  }\n  console.log(i);\n}',
    options: ['0 1 2', '0 2', '1 2', '0'],
    answer: 1,
    why: 'continue пропускает остаток шага, когда i равно 1, но цикл продолжается.',
  },
  functions: {
    code: 'function double(x) {\n  x * 2;\n}\n\nconsole.log(double(4));',
    options: ['8', '4', 'undefined', 'ошибка'],
    answer: 2,
    why: 'В функции нет return, поэтому она возвращает undefined, хотя вычисление и было выполнено.',
  },
  arrays: {
    code: 'console.log([10, 9, 1].sort());',
    options: ['[1, 9, 10]', '[10, 9, 1]', '[1, 10, 9]', '[9, 10, 1]'],
    answer: 2,
    why: 'Без функции сравнения sort сравнивает строки, а "10" идёт раньше "9".',
  },
  objects: {
    code: 'const a = { x: 1 };\nconst b = a;\nb.x = 5;\nconsole.log(a.x);',
    options: ['1', '5', 'undefined', 'ошибка'],
    answer: 1,
    why: 'b — это не копия, а ссылка на тот же объект. Для копии нужен spread: { ...a }.',
  },
  'strings-numbers-dates': {
    code: 'const word = "чай";\nword.toUpperCase();\nconsole.log(word);',
    options: ['ЧАЙ', 'чай', 'undefined', 'ошибка'],
    answer: 1,
    why: 'Методы не меняют строку, а возвращают новую. Результат здесь никуда не сохранён.',
  },
  'scope-closures': {
    code: 'let x = 1;\n\nfunction change() {\n  let x = 2;\n}\n\nchange();\nconsole.log(x);',
    options: ['1', '2', 'undefined', 'ошибка'],
    answer: 0,
    why: 'let внутри функции создал новую локальную переменную, а внешняя x не изменилась.',
  },
  'modern-js': {
    code: 'console.log(0 || 5);\nconsole.log(0 ?? 5);',
    options: ['5 5', '0 0', '5 0', '0 5'],
    answer: 2,
    why: '|| заменяет любое ложное значение, включая 0, а ?? заменяет только null и undefined.',
  },
  errors: {
    code: 'try {\n  console.log("А");\n  throw new Error("сбой");\n  console.log("Б");\n} catch {\n  console.log("В");\n}',
    options: ['А Б В', 'А В', 'В', 'А Б'],
    answer: 1,
    why: 'throw сразу переходит в catch, поэтому строка с «Б» не выполняется.',
  },
  dom: {
    code: 'const saved = String(41);\nconsole.log(saved + 1);',
    options: ['42', '411', 'null', 'ошибка'],
    answer: 1,
    why: 'В localStorage значения хранятся строками. Строка плюс число дают склейку, поэтому перед вычислением нужен Number().',
  },
  projects: {
    code: 'const todos = [{ done: true }, { done: false }, { done: false }];\nconsole.log(todos.filter((todo) => !todo.done).length);',
    options: ['1', '2', '3', '0'],
    answer: 1,
    why: 'filter оставляет невыполненные задачи: их две. Так считаются счётчики в настоящих приложениях.',
  },
  'advanced-types': {
    code: 'console.log(typeof null);\nconsole.log(0.1 + 0.2 === 0.3);',
    options: ['null true', 'object true', 'object false', 'null false'],
    answer: 2,
    why: 'typeof null даёт object из-за старой ошибки языка, которую нельзя исправить. А дробные числа хранятся с погрешностью, поэтому 0.1 + 0.2 не равно 0.3 в точности.',
  },
  'advanced-functions': {
    code: 'const user = {\n  name: "Parviz",\n  hi() {\n    return this.name;\n  },\n};\n\nconsole.log(user.hi.call({ name: "Али" }));',
    options: ['Parviz', 'Али', 'undefined', 'ошибка'],
    answer: 1,
    why: 'call задаёт this при вызове, поэтому имя объекта, к которому принадлежал метод, не важно.',
  },
  'advanced-async': {
    code: 'setTimeout(() => console.log("А"), 0);\nPromise.resolve().then(() => console.log("Б"));\nconsole.log("В");',
    options: ['А Б В', 'В А Б', 'В Б А', 'Б В А'],
    answer: 2,
    why: 'Сначала весь обычный код, затем микрозадачи (then) и только потом макрозадачи (setTimeout).',
  },
  algorithms: {
    code: 'const a = [1, 2];\nconst b = [1, 2];\nconsole.log(a === b);\nconsole.log(new Set([...a, ...b]).size);',
    options: ['true 4', 'false 2', 'false 4', 'true 2'],
    answer: 1,
    why: 'Массивы сравниваются по ссылке, а это два разных массива. Set хранит только уникальные значения, поэтому их два.',
  },
  async: {
    code: 'setTimeout(() => console.log("А"), 0);\nconsole.log("Б");',
    options: ['А Б', 'Б А', 'А', 'Б'],
    answer: 1,
    why: 'Отложенная функция выполняется только после всего текущего кода, даже при нулевой задержке.',
  },
};
