/** Неверные и другие верные решения для замыканий, современного JavaScript и обработки ошибок. */
const EMPLOYEE =
  'class Employee {\n  constructor(name, salary) {\n    this.name = name;\n    this.salary = salary;\n  }\n\n  income() {\n    return this.salary;\n  }\n\n  describe() {\n    return `${this.name}: ${this.income()}`;\n  }\n}\n\n';

export const EXPERT_WRONG: Record<string, string[]> = {
  'scope-block': [
    'console.log("Сдал");',
    'let result = "Сдал";\nif (score < 50) {\n  let result = "Не сдал";\n}\nconsole.log(result);',
  ],
  'scope-shadowing': ['let visits = 0;\n\nfunction visit() {\n  return 1;\n}', 'let visits = 5;\n\nfunction visit() {\n  visits++;\n  return visits;\n}'],
  'scope-tdz': ['console.log(15 + 1);', 'let price;\nconsole.log(price * 3);\nprice = 5;'],
  'closure-multiplier': [
    'function makeMultiplier(factor) {\n  return factor * 2;\n}',
    'function makeMultiplier(factor) {\n  return (value) => value * 2;\n}',
  ],
  'closure-counter': [
    'let count = 0;\nfunction makeCounter() {\n  return () => {\n    count++;\n    return count;\n  };\n}',
    'function makeCounter() {\n  return () => {\n    let count = 0;\n    count++;\n    return count;\n  };\n}',
    'function makeCounter() {\n  let count = 0;\n  count++;\n  return count;\n}',
  ],
  'closure-loop': ['function makeFunctions() {\n  return [() => 3, () => 3, () => 3];\n}'],
  'optional-chaining': [
    'function getStreet(user) {\n  return user?.address.street;\n}',
    'function getStreet(user) {\n  return "Рудаки";\n}',
  ],
  'nullish-coalescing': ['function showCount(count) {\n  return count ? count : "нет данных";\n}'],
  'rest-parameters': ['function sumAll(numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}', 'function sumAll(a, b) {\n  return a + b;\n}'],
  'set-unique': ['function unique(list) {\n  return new Set(list);\n}', 'function unique(list) {\n  return list;\n}'],
  'map-count': [
    'function countVotes(names) {\n  const votes = new Map();\n  for (const name of names) {\n    votes.set(name, 1);\n  }\n  return votes;\n}',
    'function countVotes(names) {\n  const votes = {};\n  for (const name of names) {\n    votes[name] = (votes[name] ?? 0) + 1;\n  }\n  return votes;\n}',
  ],
  'this-method': [
    'const wallet = {\n  balance: 100,\n  add: (amount) => {\n    this.balance += amount;\n    return this.balance;\n  },\n};',
    'const wallet = {\n  balance: 100,\n  add(amount) {\n    return this.balance + amount;\n  },\n};',
  ],
  'class-rectangle': [
    'class Rectangle {\n  area() {\n    return 12;\n  }\n  perimeter() {\n    return 14;\n  }\n}',
    'class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  area() {\n    return this.width * this.height;\n  }\n  perimeter() {\n    return this.width + this.height;\n  }\n}',
  ],
  'class-inheritance': [
    `${EMPLOYEE}class Manager {\n  constructor(name, salary, bonus) {\n    this.name = name;\n    this.salary = salary;\n    this.bonus = bonus;\n  }\n  income() {\n    return this.salary + this.bonus;\n  }\n  describe() {\n    return \`\${this.name}: \${this.income()}\`;\n  }\n}`,
    `${EMPLOYEE}class Manager extends Employee {\n  constructor(name, salary, bonus) {\n    super(name, salary);\n    this.bonus = bonus;\n  }\n}`,
    `${EMPLOYEE}class Manager extends Employee {\n  constructor(name, salary, bonus) {\n    this.bonus = bonus;\n    super(name, salary);\n  }\n}`,
  ],
  'error-types': ['console.log(2)\nconst = 1;', 'const count = 1;\nconsole.log(count);'],
  'try-catch-parse': [
    'function safeParse(text) {\n  return JSON.parse(text);\n}',
    'function safeParse(text) {\n  try {\n    JSON.parse(text);\n  } catch {\n    return null;\n  }\n}',
  ],
  'throw-divide': [
    'function divide(a, b) {\n  return a / b;\n}',
    'function divide(a, b) {\n  if (b === 0) {\n    return "Деление на ноль";\n  }\n  return a / b;\n}',
    'function divide(a, b) {\n  if (b === 0) {\n    throw new Error("Ошибка");\n  }\n  return a / b;\n}',
  ],
  'finally-steps': [
    'function process(shouldFail) {\n  const log = ["старт"];\n  if (shouldFail) {\n    log.push("ошибка");\n  } else {\n    log.push("успех");\n  }\n  return log;\n}',
    'function process(shouldFail) {\n  return ["старт", "успех", "конец"];\n}',
  ],
  'validate-age': [
    'function validateAge(age) {\n  if (age < 0 || age > 150) {\n    throw new RangeError("Недопустимый возраст");\n  }\n  return age;\n}',
    'function validateAge(age) {\n  if (typeof age !== "number") {\n    throw new TypeError("Нужно число");\n  }\n  if (age <= 0 || age >= 150) {\n    throw new RangeError("Недопустимо");\n  }\n  return age;\n}',
    'function validateAge(age) {\n  if (typeof age !== "number" || age < 0 || age > 150) {\n    throw new Error("Неверно");\n  }\n  return age;\n}',
  ],
  'run-safely': [
    'function runSafely(action) {\n  return { ok: true, value: action() };\n}',
    'function runSafely(action) {\n  try {\n    return { ok: true, value: action() };\n  } catch (error) {\n    return { ok: false, error };\n  }\n}',
    'function runSafely(action) {\n  try {\n    const value = action();\n    return value ? { ok: true, value } : { ok: false };\n  } catch (error) {\n    return { ok: false, error: error.message };\n  }\n}',
  ],
};

export const EXPERT_VALID: Record<string, string[]> = {
  'scope-block': ['const result = score >= 50 ? "Сдал" : "Не сдал";\nconsole.log(result);'],
  'closure-multiplier': ['const makeMultiplier = (factor) => (value) => value * factor;', 'function makeMultiplier(factor) {\n  return function (value) {\n    return value * factor;\n  };\n}'],
  'closure-counter': ['function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}'],
  'nullish-coalescing': ['function showCount(count) {\n  return count === null || count === undefined ? "нет данных" : count;\n}'],
  'rest-parameters': ['const sumAll = (...numbers) => {\n  let total = 0;\n  for (const number of numbers) {\n    total += number;\n  }\n  return total;\n};'],
  'set-unique': ['function unique(list) {\n  return list.filter((item, index) => list.indexOf(item) === index);\n}'],
  'class-rectangle': ['class Rectangle {\n  constructor(width, height) {\n    Object.assign(this, { width, height });\n  }\n  area() {\n    return this.width * this.height;\n  }\n  perimeter() {\n    return (this.width + this.height) * 2;\n  }\n}'],
  'optional-chaining': ['function getStreet(user) {\n  return user.address ? user.address.street : undefined;\n}'],
  'run-safely': ['const runSafely = (action) => {\n  let result;\n  try {\n    result = action();\n  } catch (error) {\n    return { error: error.message, ok: false };\n  }\n  return { value: result, ok: true };\n};'],
};
