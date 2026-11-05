import type { Lesson } from './types';

export const domLesson: Lesson = {
  slug: 'dom',
  moduleId: 13,
  level: 'hard',
  title: 'DOM и браузер',
  summary: 'Как JavaScript меняет страницу и отвечает на действия пользователя.',
  dom: {
    html: '<h2 id="title">Заказы</h2><button id="add">Добавить заказ</button><ul id="list"></ul>',
  },
  explanation: [
    'Когда браузер открывает страницу, он строит из HTML дерево объектов — DOM. JavaScript может находить в нём элементы и менять их, и страница сразу обновляется.',
    'Элементы находят через querySelector и querySelectorAll. Текст меняют через textContent, значение поля читают через value, а внешний вид удобнее всего менять через classList.',
    'addEventListener подключает функцию к событию: нажатию, вводу текста, отправке формы. События всплывают к родителям, поэтому один обработчик на списке может обслуживать все его пункты. Это называется делегированием.',
    'Безопасность: пользовательский текст вставляйте через textContent, а не innerHTML. Иначе чужая разметка и скрипты могут стать частью страницы, и это уязвимость XSS.',
    'localStorage сохраняет данные в браузере, но только строками. Не храните там пароли. В этой лаборатории хранилище учебное: оно живёт один запуск и не связано с данными сайта.',
  ],
  analogy:
    'DOM похож на дерево семьи: у каждого элемента есть родитель и дети. Событие всплывает как новость: сначала её узнаёт ребёнок, затем родитель, и так выше по дереву.',
  code: 'const list = document.querySelector("#list");\nconst button = document.querySelector("#add");\nlet count = 0;\n\nbutton.addEventListener("click", () => {\n  count++;\n  const item = document.createElement("li");\n  item.textContent = `Заказ ${count}`;\n  list.append(item);\n  console.log(`Всего заказов: ${count}`);\n});\n\nconsole.log(document.querySelector("#title").textContent);\nbutton.click();',
  output: ['Заказы', 'Всего заказов: 1'],
  lines: [
    { code: 'document.querySelector("#list")', note: 'Находит первый элемент по CSS-селектору. # означает поиск по id.' },
    { code: 'button.addEventListener("click", () => {', note: 'Функция выполнится при каждом нажатии, а не сейчас.' },
    { code: 'document.createElement("li")', note: 'Создаёт элемент, но на странице его ещё нет.' },
    { code: 'item.textContent = `Заказ ${count}`;', note: 'Безопасно задаёт текст: разметка внутри него не сработает.' },
    { code: 'list.append(item);', note: 'Теперь элемент появился на странице.' },
    { code: 'button.click();', note: 'Нажимает на кнопку из кода, поэтому в консоли сразу появляется вторая строка.' },
  ],
  tryPrompt: 'Запустите код и нажмите на кнопку на странице под консолью. Затем сделайте так, чтобы заголовок показывал количество заказов.',
  tryCode: 'const list = document.querySelector("#list");\nlet count = 0;\n\ndocument.querySelector("#add").addEventListener("click", () => {\n  count++;\n  const item = document.createElement("li");\n  item.textContent = `Заказ ${count}`;\n  list.append(item);\n});\n',
  recap: [
    'querySelector находит элемент, а textContent меняет текст.',
    'addEventListener подключает функцию к событию.',
    'createElement создаёт элемент, а append добавляет его на страницу.',
    'Пользовательский текст вставляйте через textContent, а не innerHTML.',
    'В localStorage лежат только строки, и секреты там не хранят.',
  ],
};

export const projectsLesson: Lesson = {
  slug: 'projects',
  moduleId: 14,
  level: 'hard',
  title: 'Как делать проекты',
  summary: 'Как разбить задачу на шаги и собрать настоящее приложение.',
  dom: {
    html: '<input id="text" placeholder="Новая покупка"><button id="add">Добавить</button><ul id="list"></ul>',
  },
  explanation: [
    'Большая программа пугает, только пока кажется единым целым. Разбейте её на маленькие шаги, каждый из которых можно проверить, и начинайте с самого простого рабочего варианта.',
    'Главный приём: храните данные отдельно от страницы. Данные лежат в массиве объектов, одна функция render строит из них страницу, а обработчики только меняют данные и вызывают render.',
    'Думайте обо всех состояниях: загрузка, успех, пустой результат и ошибка. Именно их обработка отличает учебный пример от настоящего приложения.',
    'В проектах этапы проверяются по порядку. Пройдёте первый этап — появится следующая проверка. Это похоже на настоящую работу: задача сдаётся по частям.',
  ],
  analogy:
    'Строя дом, вы не красите стены раньше фундамента. Сначала самая простая версия, которая стоит сама, а затем уже всё остальное: сначала программа хоть как-то работает, потом становится лучше.',
  code: 'const items = [];\nconst list = document.querySelector("#list");\n\nfunction render() {\n  list.replaceChildren();\n  for (const text of items) {\n    const item = document.createElement("li");\n    item.textContent = text;\n    list.append(item);\n  }\n}\n\nitems.push("чай");\nitems.push("хлеб");\nrender();\n\nconsole.log(list.children.length);',
  output: ['2'],
  lines: [
    { code: 'const items = [];', note: 'Единственный источник правды: страница строится только из этого массива.' },
    { code: 'function render() {', note: 'Одна функция отвечает за весь вид списка.' },
    { code: 'list.replaceChildren();', note: 'Сначала очищаем список, чтобы пункты не дублировались.' },
    { code: 'items.push("чай");', note: 'Меняем данные, а не страницу.' },
    { code: 'render();', note: 'После изменения данных перерисовываем страницу.' },
  ],
  tryPrompt: 'Запустите код и добавьте покупку на странице. Затем добавьте к каждому пункту кнопку удаления.',
  tryCode: 'const items = [];\nconst field = document.querySelector("#text");\nconst list = document.querySelector("#list");\n\nfunction render() {\n  list.replaceChildren();\n  for (const text of items) {\n    const item = document.createElement("li");\n    item.textContent = text;\n    list.append(item);\n  }\n}\n\ndocument.querySelector("#add").addEventListener("click", () => {\n  if (field.value === "") return;\n  items.push(field.value);\n  field.value = "";\n  render();\n});\n',
  recap: [
    'Разбивайте задачу на маленькие проверяемые шаги.',
    'Данные хранятся отдельно, а страница строится из них.',
    'Обрабатывайте все состояния: загрузку, успех, пустой результат и ошибку.',
    'Сначала сделайте так, чтобы работало, а затем улучшайте.',
  ],
};
