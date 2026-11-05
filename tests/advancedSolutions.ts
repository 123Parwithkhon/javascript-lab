/** Неверные и другие верные решения для модулей про массивы, объекты и строки. */
export const ADVANCED_WRONG: Record<string, string[]> = {
  'array-last-item': [
    'function lastItem(list) {\n  return list[list.length];\n}',
    'function lastItem(list) {\n  return list[0];\n}',
  ],
  'array-sum': [
    'function sumArray(numbers) {\n  let total = 0;\n  for (const number of numbers) {\n    total += number;\n    return total;\n  }\n}',
    'function sumArray(numbers) {\n  return numbers.length;\n}',
  ],
  'array-add-item': [
    'function addItem(list, item) {\n  return list.push(item);\n}',
    'function addItem(list, item) {\n  list.unshift(item);\n  return list;\n}',
  ],
  'array-remove-last': [
    'function removeLast(list) {\n  return list.pop();\n}',
    'function removeLast(list) {\n  list.shift();\n  return list;\n}',
  ],
  'array-first-n': [
    'function firstN(list, n) {\n  return list.slice(n);\n}',
    'function firstN(list, n) {\n  const result = [];\n  for (let i = 0; i < n; i++) {\n    result.push(list[i]);\n  }\n  return result;\n}',
  ],
  'array-max': [
    'function findMax(numbers) {\n  let max = 0;\n  for (const number of numbers) {\n    if (number > max) {\n      max = number;\n    }\n  }\n  return max;\n}',
    'function findMax(numbers) {\n  return numbers[numbers.length - 1];\n}',
  ],
  'array-map': [
    'function doubleAll(numbers) {\n  numbers.map((number) => number * 2);\n}',
    'function doubleAll(numbers) {\n  return numbers.map((number) => number + 2);\n}',
  ],
  'array-filter': [
    'function onlyAdults(ages) {\n  return ages.filter((age) => age > 18);\n}',
    'function onlyAdults(ages) {\n  return ages.map((age) => age >= 18);\n}',
  ],
  'array-every': [
    'function allPassed(scores) {\n  return scores.some((score) => score >= 50);\n}',
    'function allPassed(scores) {\n  return scores[0] >= 50;\n}',
  ],
  'array-reduce': [
    'function multiplyAll(numbers) {\n  return numbers.reduce((result, number) => result * number, 0);\n}',
    'function multiplyAll(numbers) {\n  return numbers.reduce((result, number) => result * number);\n}',
  ],
  'array-sort': ['function sortAscending(numbers) {\n  return numbers.sort((a, b) => b - a);\n}'],
  'object-create': [
    'const student = { name: "Parviz" };\nconsole.log(student.name);',
    'const student = { name: "Parviz", age: "20" };\nconsole.log(student.name);',
    'const student = { name: "Parviz", age: 20 };\nconsole.log(student);',
  ],
  'object-read': ['function getCity(user) {\n  return user.name;\n}', 'function getCity(user) {\n  return "Душанбе";\n}'],
  'object-change': [
    'function birthday(person) {\n  return person.age + 1;\n}',
    'function birthday(person) {\n  person.age += 1;\n}',
  ],
  'object-keys': ['function countKeys(obj) {\n  return obj.length;\n}'],
  'object-values-sum': ['function totalExpenses(expenses) {\n  return Object.keys(expenses).length;\n}'],
  'object-entries': ['function priceList(prices) {\n  return Object.keys(prices);\n}'],
  'object-destructuring': ['function describe({ name, age }) {\n  return `${age}, ${name} лет`;\n}'],
  'object-spread': [
    'function withPrice(product, price) {\n  return { price };\n}',
    'function withPrice(product, price) {\n  return { price, ...product };\n}',
  ],
  'objects-filter-titles': [
    'function affordable(products, budget) {\n  return products.filter((product) => product.price <= budget);\n}',
    'function affordable(products, budget) {\n  return products.filter((product) => product.price < budget).map((product) => product.title);\n}',
  ],
  'objects-cart-total': [
    'function cartTotal(items) {\n  return items.reduce((total, item) => total + item.price, 0);\n}',
    'function cartTotal(items) {\n  return items.reduce((total, item) => total + item.price * item.quantity);\n}',
  ],
  'string-shout': ['function shout(text) {\n  return text + "!";\n}', 'function shout(text) {\n  return text.toUpperCase();\n}'],
  'string-email-domain': ['function isGmail(email) {\n  return email.includes("@gmail.com");\n}'],
  'string-count-words': [
    'function countWords(text) {\n  return text.split(" ").length;\n}',
    'function countWords(text) {\n  return text.length;\n}',
  ],
  'string-reverse': ['function reverseText(text) {\n  return text.split("").join("");\n}'],
  'string-palindrome': ['function isPalindrome(word) {\n  return word === word.split("").reverse().join("");\n}'],
  'number-round': [
    'function roundPrice(value) {\n  return value.toFixed(2);\n}',
    'function roundPrice(value) {\n  return Math.round(value);\n}',
  ],
  'number-average': ['function average(numbers) {\n  let total = 0;\n  for (const number of numbers) {\n    total += number;\n  }\n  return total / numbers.length;\n}'],
  'date-days-between': [
    'function daysBetween(from, to) {\n  return new Date(to).getDate() - new Date(from).getDate();\n}',
    'function daysBetween(from, to) {\n  return new Date(to).getTime() - new Date(from).getTime();\n}',
  ],
};

export const ADVANCED_VALID: Record<string, string[]> = {
  'array-last-item': ['const lastItem = (list) => list.at(-1);'],
  'array-sum': ['function sumArray(numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}'],
  'array-first-n': ['function firstN(list, n) {\n  const result = [];\n  for (let i = 0; i < n && i < list.length; i++) {\n    result.push(list[i]);\n  }\n  return result;\n}'],
  'array-max': ['const findMax = (numbers) => Math.max(...numbers);'],
  'array-map': ['function doubleAll(numbers) {\n  const result = [];\n  for (const number of numbers) {\n    result.push(number * 2);\n  }\n  return result;\n}'],
  'object-create': ['const student = { age: 20, name: "Parviz" };\nconsole.log(student.name);'],
  'object-change': ['function birthday(person) {\n  return { age: person.age + 1, name: person.name };\n}'],
  'object-spread': ['function withPrice(product, price) {\n  const copy = Object.assign({}, product);\n  copy.price = price;\n  return copy;\n}'],
  'number-round': ['function roundPrice(value) {\n  return Number(value.toFixed(2));\n}'],
  'string-reverse': ['function reverseText(text) {\n  let result = "";\n  for (const letter of text) {\n    result = letter + result;\n  }\n  return result;\n}'],
};
