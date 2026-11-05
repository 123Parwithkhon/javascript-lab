import type { Task } from '../types';
import { LAB_SETUP } from './module12';

const ABOUT = 'Это итоговый проект: каждая проверка — отдельный этап. Этапы проходятся по порядку, а страница появляется под консолью, и с ней можно работать.';
const act = (steps: string, result: string) => `(async () => { ${steps} return ${result}; })()`;
const STYLE = 'input,select,button{font:inherit;padding:4px 8px;margin:2px}li{margin:4px 0}.done{text-decoration:line-through;color:#667}';

const calculator: Task = {
  id: 'project-calculator',
  moduleId: 14,
  topic: 'проект',
  level: 'hard',
  title: 'Калькулятор',
  theory: `${ABOUT} Значения полей — строки, поэтому их нужно преобразовать в числа.`,
  description: 'Создайте калькулятор: при нажатии на #calc покажите в #result результат действия #op над числами #a и #b.',
  dom: {
    css: STYLE,
    html: '<input id="a" type="number"><select id="op"><option>+</option><option>-</option><option>*</option><option>/</option></select><input id="b" type="number"><button id="calc">=</button><p id="result"></p>',
  },
  initialCode: '// Поля: #a, #b, #op. Кнопка: #calc. Результат: #result\n',
  cases: [
    {
      label: 'Этап 1: сложение чисел',
      checks: [{ label: '2 + 3', expression: act('await type("#a", "2"); await type("#b", "3"); await click("#calc");', 'text("#result")'), expected: '5' }],
    },
    {
      label: 'Этап 2: все действия',
      checks: [
        { label: '7 - 2', expression: act('await type("#a", "7"); await type("#op", "-"); await type("#b", "2"); await click("#calc");', 'text("#result")'), expected: '5' },
        { label: '4 * 3', expression: act('await type("#a", "4"); await type("#op", "*"); await type("#b", "3"); await click("#calc");', 'text("#result")'), expected: '12' },
        { label: '1 / 4', expression: act('await type("#a", "1"); await type("#op", "/"); await type("#b", "4"); await click("#calc");', 'text("#result")'), expected: '0.25' },
      ],
    },
    {
      label: 'Этап 3: ошибки ввода',
      checks: [
        { label: 'деление на ноль', expression: act('await type("#a", "1"); await type("#op", "/"); await type("#b", "0"); await click("#calc");', 'text("#result")'), expected: 'Нельзя делить на ноль' },
        { label: 'пустое поле', expression: act('await type("#a", ""); await type("#op", "+"); await type("#b", "1"); await click("#calc");', 'text("#result")'), expected: 'Введите оба числа' },
      ],
    },
  ],
  hints: [
    'Начните с этапа 1: прочитайте два значения и сложите их как числа.',
    'Выбор действия удобно написать через switch или несколько if.',
    'Проверку пустых полей и деления на ноль поставьте до вычисления.',
  ],
  solution:
    'const a = document.querySelector("#a");\nconst b = document.querySelector("#b");\nconst op = document.querySelector("#op");\nconst result = document.querySelector("#result");\n\nfunction calculate(x, y, action) {\n  if (action === "+") return x + y;\n  if (action === "-") return x - y;\n  if (action === "*") return x * y;\n  return x / y;\n}\n\ndocument.querySelector("#calc").addEventListener("click", () => {\n  if (a.value === "" || b.value === "") {\n    result.textContent = "Введите оба числа";\n    return;\n  }\n  if (op.value === "/" && Number(b.value) === 0) {\n    result.textContent = "Нельзя делить на ноль";\n    return;\n  }\n  result.textContent = calculate(Number(a.value), Number(b.value), op.value);\n});\n',
  explanation: 'Вычисление вынесено в отдельную функцию, а работа со страницей осталась снаружи. Такое разделение делает код проще для проверки и изменений.',
};

const todo: Task = {
  id: 'project-todo',
  moduleId: 14,
  topic: 'проект',
  level: 'hard',
  title: 'Список задач',
  theory: `${ABOUT} Удобный подход: хранить задачи в массиве объектов и после каждого изменения заново рисовать список из этого массива.`,
  description: 'Создайте список задач: добавление из поля #text по кнопке #add, отметка «выполнено» и удаление. Задачи хранятся в localStorage по ключу todos в формате JSON.',
  dom: {
    css: STYLE,
    html: '<input id="text" placeholder="Новая задача"><button id="add">Добавить</button><ul id="list"></ul><p>Осталось: <span id="left">0</span></p>',
  },
  initialCode: '// Каждая задача: <li> с <span class="title">, <button class="toggle"> и <button class="remove">\n// Выполненная задача получает у <li> класс done\n',
  cases: [
    {
      label: 'Этап 1: добавление задач',
      checks: [
        { label: 'задача добавлена', expression: act('await type("#text", "Учить JS"); await click("#add");', 'text("#list li .title")'), expected: 'Учить JS' },
        { label: 'поле очищено', expression: 'value("#text")', expected: '' },
        { label: 'пустая не добавляется', expression: act('await click("#add");', 'count("#list li")'), expected: 1 },
        { label: 'счётчик', expression: 'text("#left")', expected: '1' },
      ],
    },
    {
      label: 'Этап 2: отметка и удаление',
      checks: [
        { label: 'две задачи', expression: act('await type("#text", "А"); await click("#add"); await type("#text", "Б"); await click("#add");', 'count("#list li")'), expected: 2 },
        { label: 'отметка выполнения', expression: act('await click("#list li .toggle");', 'hasClass("#list li", "done")'), expected: true },
        { label: 'счётчик уменьшился', expression: 'text("#left")', expected: '1' },
        { label: 'повторное нажатие снимает отметку', expression: act('await click("#list li .toggle");', 'hasClass("#list li", "done")'), expected: false },
        { label: 'удаление', expression: act('await click("#list li .remove");', 'text("#list li .title")'), expected: 'Б' },
      ],
    },
    {
      label: 'Этап 3: сохранение',
      checks: [
        {
          label: 'задачи сохраняются в localStorage',
          expression: act('await type("#text", "В"); await click("#add");', 'JSON.parse(localStorage.getItem("todos")).length'),
          expected: 1,
        },
      ],
    },
    {
      label: 'Этап 4: загрузка сохранённых задач',
      storage: { todos: '[{"text":"Старая","done":true},{"text":"Новая","done":false}]' },
      checks: [
        { label: 'список восстановлен', expression: 'count("#list li")', expected: 2 },
        { label: 'отметка восстановлена', expression: 'hasClass("#list li", "done")', expected: true },
        { label: 'счётчик верный', expression: 'text("#left")', expected: '1' },
      ],
    },
  ],
  hints: [
    'Храните задачи в массиве объектов вида { text, done } и пишите одну функцию render.',
    'Обработчик нажатий удобно подключить к самому списку: помните про делегирование.',
    'Текст задачи задавайте через textContent, а сохраняйте после каждого изменения.',
  ],
  solution:
    'const field = document.querySelector("#text");\nconst list = document.querySelector("#list");\nconst left = document.querySelector("#left");\nlet todos = JSON.parse(localStorage.getItem("todos") ?? "[]");\n\nfunction render() {\n  list.replaceChildren();\n  todos.forEach((todo, index) => {\n    const item = document.createElement("li");\n    item.classList.toggle("done", todo.done);\n    item.dataset.index = index;\n\n    const title = document.createElement("span");\n    title.className = "title";\n    title.textContent = todo.text;\n\n    const toggle = document.createElement("button");\n    toggle.className = "toggle";\n    toggle.textContent = "✓";\n\n    const remove = document.createElement("button");\n    remove.className = "remove";\n    remove.textContent = "×";\n\n    item.append(title, toggle, remove);\n    list.append(item);\n  });\n  left.textContent = todos.filter((todo) => !todo.done).length;\n  localStorage.setItem("todos", JSON.stringify(todos));\n}\n\ndocument.querySelector("#add").addEventListener("click", () => {\n  if (field.value === "") return;\n  todos.push({ text: field.value, done: false });\n  field.value = "";\n  render();\n});\n\nlist.addEventListener("click", (event) => {\n  const item = event.target.closest("li");\n  if (!item) return;\n  const index = Number(item.dataset.index);\n  if (event.target.matches(".toggle")) todos[index].done = !todos[index].done;\n  if (event.target.matches(".remove")) todos.splice(index, 1);\n  render();\n});\n\nrender();\n',
  explanation: 'Главная идея проекта: данные живут в массиве, а страница всегда строится из них. Именно на этой идее основаны современные библиотеки вроде React.',
};

const expenses: Task = {
  id: 'project-expenses',
  moduleId: 14,
  topic: 'проект',
  level: 'hard',
  title: 'Учёт расходов',
  theory: `${ABOUT} Здесь объединяются формы, массивы объектов, filter и reduce.`,
  description: 'Создайте учёт расходов: форма #form добавляет запись (#title, #amount, #category), #total показывает сумму, а #filter оставляет записи выбранной категории.',
  dom: {
    css: STYLE,
    html: '<form id="form"><input id="title" placeholder="Название"><input id="amount" type="number"><select id="category"><option>еда</option><option>транспорт</option></select><button>Добавить</button></form><p id="error"></p><label>Показать: <select id="filter"><option value="все">все</option><option>еда</option><option>транспорт</option></select></label><ul id="list"></ul><p>Итого: <span id="total">0</span> сомони</p>',
  },
  initialCode: '// Каждая запись: <li>Название: сумма</li>\n',
  cases: [
    {
      label: 'Этап 1: добавление записи и итог',
      checks: [
        { label: 'запись появилась', expression: act('await type("#title", "чай"); await type("#amount", "5"); await submit("#form");', 'text("#list li")'), expected: 'чай: 5' },
        { label: 'страница не перезагружается', expression: act('await type("#title", "хлеб"); await type("#amount", "3");', 'submit("#form")'), expected: true },
        { label: 'итог', expression: 'text("#total")', expected: '8' },
      ],
    },
    {
      label: 'Этап 2: проверка ввода',
      checks: [
        { label: 'пустое название', expression: act('await type("#title", ""); await type("#amount", "5"); await submit("#form");', 'count("#list li")'), expected: 0 },
        { label: 'неположительная сумма', expression: act('await type("#title", "чай"); await type("#amount", "-1"); await submit("#form");', 'count("#list li")'), expected: 0 },
        { label: 'сообщение об ошибке', expression: 'text("#error")', expected: 'Проверьте название и сумму' },
      ],
    },
    {
      label: 'Этап 3: фильтр по категории',
      checks: [
        {
          label: 'фильтр показывает категорию',
          expression: act(
            'await type("#title", "чай"); await type("#amount", "5"); await type("#category", "еда"); await submit("#form"); await type("#title", "такси"); await type("#amount", "20"); await type("#category", "транспорт"); await submit("#form"); await type("#filter", "транспорт");',
            '[count("#list li"), text("#list li"), text("#total")]',
          ),
          expected: [1, 'такси: 20', '20'],
        },
        { label: 'снова все записи', expression: act('await type("#filter", "все");', '[count("#list li"), text("#total")]'), expected: [2, '25'] },
      ],
    },
  ],
  hints: [
    'Храните записи в массиве и рисуйте список одной функцией, как в проекте со списком задач.',
    'Сумма из поля приходит строкой: сохраняйте её как число.',
    'В функции отрисовки сначала отфильтруйте записи, а итог считайте уже по результату.',
  ],
  solution:
    'const form = document.querySelector("#form");\nconst title = document.querySelector("#title");\nconst amount = document.querySelector("#amount");\nconst category = document.querySelector("#category");\nconst filter = document.querySelector("#filter");\nconst list = document.querySelector("#list");\nconst total = document.querySelector("#total");\nconst error = document.querySelector("#error");\nconst records = [];\n\nfunction render() {\n  const visible = records.filter((record) => filter.value === "все" || record.category === filter.value);\n  list.replaceChildren();\n  for (const record of visible) {\n    const item = document.createElement("li");\n    item.textContent = `${record.title}: ${record.amount}`;\n    list.append(item);\n  }\n  total.textContent = visible.reduce((sum, record) => sum + record.amount, 0);\n}\n\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const value = Number(amount.value);\n  if (title.value === "" || value <= 0) {\n    error.textContent = "Проверьте название и сумму";\n    return;\n  }\n  error.textContent = "";\n  records.push({ title: title.value, amount: value, category: category.value });\n  render();\n});\n\nfilter.addEventListener("change", render);\n',
  explanation: 'Итог и список считаются из одних и тех же данных, поэтому не могут разойтись. Сохранить записи между запусками вы уже умеете: это хорошее самостоятельное улучшение.',
};

const quiz: Task = {
  id: 'project-quiz',
  moduleId: 14,
  topic: 'проект',
  level: 'hard',
  title: 'Викторина',
  theory: `${ABOUT} Массив questions уже есть: каждый вопрос содержит text, options и answer (индекс правильного варианта).`,
  description: 'Создайте викторину: покажите вопрос в #question и варианты кнопками .option в #options. После ответа покажите следующий вопрос, а в конце выведите в #score текст вида: Результат: 1 из 2.',
  dom: { css: STYLE, html: '<h2 id="question"></h2><div id="options"></div><p id="score"></p>' },
  setup: 'window.questions = [{ text: "Что выводит в консоль?", options: ["alert", "console.log"], answer: 1 }, { text: "Какой оператор сравнивает строго?", options: ["===", "="], answer: 0 }];',
  initialCode: '// Массив questions уже существует\n',
  cases: [
    {
      label: 'Этап 1: показ первого вопроса',
      checks: [
        { label: 'текст вопроса', expression: 'text("#question")', expected: 'Что выводит в консоль?' },
        { label: 'варианты ответа', expression: 'count("#options .option")', expected: 2 },
        { label: 'текст варианта', expression: 'text("#options .option")', expected: 'alert' },
      ],
    },
    {
      label: 'Этап 2: переход к следующему вопросу',
      checks: [
        { label: 'второй вопрос', expression: act('await click("#options .option");', 'text("#question")'), expected: 'Какой оператор сравнивает строго?' },
        { label: 'старые варианты убраны', expression: 'count("#options .option")', expected: 2 },
        { label: 'новый текст варианта', expression: 'text("#options .option")', expected: '===' },
      ],
    },
    {
      label: 'Этап 3: подсчёт результата',
      checks: [
        {
          label: 'один верный ответ из двух',
          expression: act('await click("#options .option"); await click("#options .option");', 'text("#score")'),
          expected: 'Результат: 1 из 2',
        },
        { label: 'варианты больше не показываются', expression: 'count("#options .option")', expected: 0 },
      ],
    },
    {
      label: 'Этап 4: все ответы верные',
      checks: [
        {
          label: 'два верных ответа',
          expression: act(
            'document.querySelectorAll("#options .option")[1].click(); await settled(); await click("#options .option");',
            'text("#score")',
          ),
          expected: 'Результат: 2 из 2',
        },
      ],
    },
  ],
  hints: [
    'Понадобятся переменные с номером текущего вопроса и числом верных ответов.',
    'Напишите функцию show, которая очищает #options и создаёт кнопки для текущего вопроса.',
    'В обработчике сравните индекс варианта с answer, увеличьте номер вопроса и снова вызовите show.',
  ],
  solution:
    'const question = document.querySelector("#question");\nconst options = document.querySelector("#options");\nconst score = document.querySelector("#score");\nlet current = 0;\nlet correct = 0;\n\nfunction show() {\n  options.replaceChildren();\n  if (current === questions.length) {\n    question.textContent = "Готово";\n    score.textContent = `Результат: ${correct} из ${questions.length}`;\n    return;\n  }\n  const { text, options: variants, answer } = questions[current];\n  question.textContent = text;\n  variants.forEach((variant, index) => {\n    const button = document.createElement("button");\n    button.className = "option";\n    button.textContent = variant;\n    button.addEventListener("click", () => {\n      if (index === answer) correct++;\n      current++;\n      show();\n    });\n    options.append(button);\n  });\n}\n\nshow();\n',
  explanation: 'Приложение определяется данными: можно добавить хоть сто вопросов, не меняя код. Это и есть главный плюс отделения данных от логики.',
};

const search: Task = {
  id: 'project-search',
  moduleId: 14,
  topic: 'проект',
  level: 'hard',
  title: 'Поиск через API',
  setup: LAB_SETUP,
  theory: `${ABOUT} Адрес /products возвращает товары вида { title, price }. Адрес /offline имитирует отсутствие сети, а fetch здесь учебный.`,
  description: 'Создайте поиск: при нажатии на #search загрузите товары с адреса из поля #url (по умолчанию /products) и покажите в #results названия с текстом из поля #query. Сообщения показывайте в #status.',
  dom: {
    css: STYLE,
    html: '<input id="url" value="/products"><input id="query" placeholder="Поиск"><button id="search">Найти</button><p id="status"></p><ul id="results"></ul>',
  },
  initialCode: '// Результат: <li> с названием товара внутри #results\n',
  cases: [
    {
      label: 'Этап 1: загрузка и показ',
      checks: [{ label: 'все товары', expression: act('await click("#search");', 'count("#results li")'), expected: 3 }],
    },
    {
      label: 'Этап 2: поиск без учёта регистра',
      checks: [
        { label: 'поиск находит товар', expression: act('await type("#query", "МЁД"); await click("#search");', '[count("#results li"), text("#results li")]'), expected: [1, 'мёд'] },
        { label: 'старые результаты убраны', expression: act('await type("#query", "хлеб"); await click("#search");', '[count("#results li"), text("#results li")]'), expected: [1, 'хлеб'] },
      ],
    },
    {
      label: 'Этап 3: состояния загрузки',
      checks: [
        { label: 'ничего не найдено', expression: act('await type("#query", "кофе"); await click("#search");', 'text("#status")'), expected: 'Ничего не найдено' },
        { label: 'показ загрузки', expression: '(() => { type("#query", "чай"); document.querySelector("#search").click(); return text("#status"); })()', expected: 'Загрузка...' },
        { label: 'сообщение очищено после ответа', expression: act('await settled();', 'text("#status")'), expected: '' },
      ],
    },
    {
      label: 'Этап 4: ошибки сервера и сети',
      checks: [
        { label: 'ответ 404', expression: act('await type("#url", "/missing"); await click("#search");', 'text("#status")'), expected: 'Ошибка сервера' },
        { label: 'нет сети', expression: act('await type("#url", "/offline"); await click("#search");', 'text("#status")'), expected: 'Нет соединения' },
      ],
    },
  ],
  hints: [
    'Подключите async-функцию к кнопке и начните с показа сообщения о загрузке.',
    'Приведите и запрос, и название к нижнему регистру, прежде чем сравнивать.',
    'Сетевую ошибку поймает try...catch, а ответ 404 нужно проверить через response.ok.',
  ],
  solution:
    'const url = document.querySelector("#url");\nconst query = document.querySelector("#query");\nconst status = document.querySelector("#status");\nconst results = document.querySelector("#results");\n\ndocument.querySelector("#search").addEventListener("click", async () => {\n  status.textContent = "Загрузка...";\n  results.replaceChildren();\n  try {\n    const response = await fetch(url.value);\n    if (!response.ok) {\n      status.textContent = "Ошибка сервера";\n      return;\n    }\n    const products = await response.json();\n    const text = query.value.toLowerCase();\n    const found = products.filter((product) => product.title.toLowerCase().includes(text));\n    status.textContent = found.length === 0 ? "Ничего не найдено" : "";\n    for (const product of found) {\n      const item = document.createElement("li");\n      item.textContent = product.title;\n      results.append(item);\n    }\n  } catch {\n    status.textContent = "Нет соединения";\n  }\n});\n',
  explanation: 'Вы обработали все состояния настоящего приложения: загрузка, успех, пустой результат и два вида ошибок. Поздравляем: это полный путь от первой строки кода до работы с данными из сети!',
};

export const module14Tasks: Task[] = [calculator, todo, expenses, quiz, search];
