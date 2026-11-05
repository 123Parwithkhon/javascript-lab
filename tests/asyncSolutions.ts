/** Неверные и другие верные решения для асинхронного модуля. */
export const ASYNC_WRONG: Record<string, string[]> = {
  'async-order': [
    'console.log("Заказ принят");\nconsole.log("Заказ готов");\nconsole.log("Готовим");',
    'console.log("Заказ принят");\nsetTimeout(() => console.log("Готовим"), 10);\nconsole.log("Заказ готов");',
  ],
  'async-callback': [
    'function delayedSum(a, b, callback) {\n  return a + b;\n}',
    'function delayedSum(a, b, callback) {\n  callback(a + b);\n}',
    'function delayedSum(a, b, callback) {\n  setTimeout(() => {\n    return a + b;\n  }, 5);\n}',
  ],
  'promise-create': [
    'function wait(ms, value) {\n  setTimeout(() => value, ms);\n}',
    'function wait(ms, value) {\n  return Promise.resolve(value);\n}',
    'function wait(ms, value) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(), ms);\n  });\n}',
  ],
  'fetch-then': [
    'function getName(id) {\n  fetch(`/users/${id}`).then((response) => response.json()).then((user) => user.name);\n}',
    'function getName(id) {\n  return fetch(`/users/${id}`).then((response) => response.json());\n}',
    'function getName(id) {\n  return Promise.resolve("Parviz");\n}',
  ],
  'async-await': [
    'async function getCity(id) {\n  const response = fetch(`/users/${id}`);\n  const user = response.json();\n  return user.city;\n}',
    'async function getCity(id) {\n  const response = await fetch(`/users/${id}`);\n  const user = response.json();\n  return user.city;\n}',
  ],
  'async-errors': [
    'async function safeLoad(url) {\n  const response = await fetch(url);\n  return response.json();\n}',
    'async function safeLoad(url) {\n  try {\n    const response = await fetch(url);\n    return await response.json();\n  } catch {\n    return null;\n  }\n}',
    'async function safeLoad(url) {\n  const response = await fetch(url);\n  if (!response.ok) {\n    return null;\n  }\n  return response.json();\n}',
  ],
  'async-total': [
    'async function catalogSummary(maxPrice) {\n  const response = await fetch("/products");\n  const products = await response.json();\n  return { count: products.length, total: 48 };\n}',
    'async function catalogSummary(maxPrice) {\n  const response = await fetch("/products");\n  const products = await response.json();\n  const matching = products.filter((product) => product.price < maxPrice);\n  return { count: matching.length, total: matching.reduce((sum, product) => sum + product.price, 0) };\n}',
  ],
};

export const ASYNC_VALID: Record<string, string[]> = {
  'async-callback': ['const delayedSum = (a, b, callback) => setTimeout(() => callback(a + b), 5);'],
  'promise-create': ['const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));'],
  'fetch-then': ['async function getName(id) {\n  const response = await fetch(`/users/${id}`);\n  return (await response.json()).name;\n}'],
  'async-await': ['function getCity(id) {\n  return fetch(`/users/${id}`).then((response) => response.json()).then((user) => user.city);\n}'],
};
