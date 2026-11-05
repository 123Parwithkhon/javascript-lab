import { LAB_SETUP } from '../tasks/module12';
import type { Lesson } from './types';

export const asyncLesson: Lesson = {
  slug: 'async',
  moduleId: 12,
  level: 'hard',
  title: 'Асинхронный JavaScript',
  summary: 'Таймеры, промисы, async/await и загрузка данных.',
  setup: LAB_SETUP,
  explanation: [
    'Некоторые операции занимают время: загрузка данных или таймер. Чтобы страница не замирала, JavaScript не ждёт их, а продолжает выполнять код и возвращается к результату позже.',
    'Сначала для этого использовали callback: функцию, которую вызовут, когда результат будет готов. Promise — более удобный объект будущего результата: then получает значение, а catch обрабатывает ошибку.',
    'async и await позволяют писать асинхронный код так, будто он выполняется сверху вниз. Ошибки в нём ловит обычный try...catch.',
    'fetch загружает данные по адресу, а response.json() разбирает ответ. В этой лаборатории настоящая сеть отключена ради безопасности, поэтому fetch учебный, но синтаксис у него тот же, что и в реальных проектах.',
  ],
  analogy:
    'Вы заказали чайник чая в чайхане и получили обещание принести его. Вы не стоите у кухни, а разговариваете дальше. Promise — это и есть такое обещание: его либо выполнят, либо сообщат, что чай закончился.',
  code: 'console.log("Начало");\n\nasync function loadName(id) {\n  const response = await fetch(`/users/${id}`);\n  const user = await response.json();\n  return user.name;\n}\n\nloadName(1).then((name) => console.log(name));\n\nconsole.log("Конец");',
  output: ['Начало', 'Конец', 'Parviz'],
  lines: [
    { code: 'async function loadName(id)', note: 'Функция с пометкой async всегда возвращает промис.' },
    { code: 'await fetch(`/users/${id}`)', note: 'await приостанавливает эту функцию до ответа, а остальная программа продолжает работать.' },
    { code: 'await response.json()', note: 'Разбор ответа тоже асинхронный, поэтому здесь нужен второй await.' },
    { code: 'loadName(1).then((name) => console.log(name));', note: 'Снаружи результат получают через then.' },
    { code: 'console.log("Конец");', note: 'Эта строка выполняется раньше, чем приходит имя: поэтому «Конец» выводится вторым.' },
  ],
  tryPrompt: 'Измените адрес на /users/2, затем на /users/99 и посмотрите, что будет. Подумайте, как обработать такой ответ.',
  tryCode: 'async function show() {\n  const response = await fetch("/products");\n  const products = await response.json();\n  console.log(products.map((product) => product.title));\n}\n\nshow();\nconsole.log("Загружаем...");\n',
  recap: [
    'Асинхронный код не блокирует программу.',
    'Promise — объект будущего результата, then и catch работают с ним.',
    'await можно использовать только в функции с async.',
    'fetch не считает ответ 404 ошибкой: проверяйте response.ok.',
  ],
};
