/** Неверные и другие верные решения для продвинутого курса. */
export const MASTERY_WRONG: Record<string, string[]> = {
  'adv-object-is': ['function isSameValue(a, b) {\n  return a == b;\n}', 'function isSameValue(a, b) {\n  return a === b || (a !== a && b !== b);\n}'],
  'adv-strict-number': [
    'function toNumberOrNull(text) {\n  const v = Number(text);\n  return Number.isNaN(v) ? null : v;\n}',
    'function toNumberOrNull(text) {\n  const v = parseInt(text);\n  return Number.isNaN(v) ? null : v;\n}',
  ],
  'adv-bigint': [
    'function factorial(n) {\n  let r = 1;\n  for (let i = 2; i <= Number(n); i++) r *= i;\n  return r;\n}',
    'function factorial(n) {\n  let r = 1n;\n  for (let i = 2n; i < n; i++) r *= i;\n  return r;\n}',
  ],
  'adv-symbol': ['const secret = "secret";\nconst user = { name: "Parviz", [secret]: 42 };', 'const secret = Symbol("secret");\nconst user = { name: "Parviz", secret: 42 };'],
  'adv-bitwise': [
    'function hasRight(m, r) {\n  return m & r;\n}\nfunction addRight(m, r) {\n  return m | r;\n}\nfunction removeRight(m, r) {\n  return m & ~r;\n}',
    'function hasRight(m, r) {\n  return (m & r) !== 0;\n}\nfunction addRight(m, r) {\n  return m + r;\n}\nfunction removeRight(m, r) {\n  return m - r;\n}',
  ],
  'adv-prototype': [
    'function Person(name) {\n  this.name = name;\n  this.hello = function () {\n    return `Привет, ${this.name}`;\n  };\n}',
    'function Person(name) {\n  this.name = name;\n}\nPerson.prototype.hello = () => `Привет, ${this.name}`;',
  ],
  'adv-own-keys': ['function ownKeys(obj) {\n  return ["b"];\n}'],
  'adv-weakmap': [
    'function countVisit(user) {\n  user.visits = (user.visits ?? 0) + 1;\n  return user.visits;\n}',
    'let n = 0;\nfunction countVisit(user) {\n  n++;\n  return n;\n}',
  ],
  'adv-arguments': ['function lastArgument() {\n  return arguments[arguments.length];\n}', 'const lastArgument = () => arguments[0];'],
  'adv-iife': [
    'const counter = (() => {\n  return { value: 0, increment() { return ++this.value; }, get() { return this.value; } };\n})();',
    'const counter = (() => {\n  let value = 0;\n  return { increment() { return value + 1; }, get() { return value; } };\n})();',
  ],
  'adv-recursion': [
    'function sumNested(list) {\n  return list.flat().reduce((a, b) => a + b, 0);\n}',
    'function sumNested(list) {\n  return list.reduce((a, b) => a + b, 0);\n}',
  ],
  'adv-bind': [
    'const timer = { seconds: 5, getSeconds() { return this.seconds; } };\nconst read = () => 5;',
    'const timer = { seconds: 5, getSeconds() { return this.seconds; } };\nconst read = timer.getSeconds.bind({ seconds: 5 });',
  ],
  'adv-call-apply': ['function introduce(greeting) {\n  return `${greeting}, я ${this.name}`;\n}\nfunction introduceAs(user, greeting) {\n  return introduce(greeting);\n}\nfunction joinAll() {\n  return arguments.join("-");\n}'],
  'adv-pipe': [
    'function pipe(...fns) {\n  return (v) => fns.reduceRight((r, f) => f(r), v);\n}',
    'function pipe(...fns) {\n  return (v) => fns[0](v);\n}',
  ],
  'adv-curry': [
    'function curry(fn) {\n  return (a) => (b) => (c) => fn(a, b, c);\n}',
    'function curry(fn) {\n  const args = [];\n  return function collect(...more) {\n    args.push(...more);\n    return args.length >= fn.length ? fn(...args) : collect;\n  };\n}',
  ],
  'adv-memoize': [
    'function memoize(fn) {\n  const cache = {};\n  return (a) => {\n    if (!cache[a]) cache[a] = fn(a);\n    return cache[a];\n  };\n}',
    'const cache = new Map();\nfunction memoize(fn) {\n  return (a) => {\n    if (!cache.has(a)) cache.set(a, fn(a));\n    return cache.get(a);\n  };\n}',
    'function memoize(fn) {\n  return fn;\n}',
  ],
  'adv-debounce': [
    'function debounce(fn, ms) {\n  return (...args) => setTimeout(() => fn(...args), ms);\n}',
    'function debounce(fn, ms) {\n  return (...args) => fn(...args);\n}',
    'function debounce(fn, ms) {\n  let t;\n  return (a) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(a), ms);\n  };\n}',
  ],
  'adv-iterator': [
    'function range(from, to) {\n  const r = [];\n  for (let i = from; i <= to; i++) r.push(i);\n  return r;\n}',
    'function range(from, to) {\n  let c = from;\n  return {\n    [Symbol.iterator]() {\n      return { next: () => (c > to ? { done: true } : { value: c++, done: false }) };\n    },\n  };\n}',
  ],
  'adv-generator': [
    'function* fibonacci() {\n  yield 0;\n  yield 1;\n  yield 1;\n  yield 2;\n  yield 3;\n  yield 5;\n}',
    'function* fibonacci() {\n  let a = 1;\n  let b = 1;\n  while (true) {\n    yield a;\n    [a, b] = [b, a + b];\n  }\n}',
  ],
  'adv-event-loop': [
    'Promise.resolve().then(() => console.log("таймер"));\nsetTimeout(() => console.log("промис"), 0);\nconsole.log("обычный");',
    'console.log("таймер");\nconsole.log("промис");\nconsole.log("обычный");',
  ],
  'adv-promise-all': [
    'async function loadNames(ids) {\n  const names = [];\n  for (const id of ids) {\n    const r = await fetch(`/users/${id}`);\n    names.push((await r.json()).name);\n  }\n  return names;\n}',
    'function loadNames(ids) {\n  return ids.map((id) => fetch(`/users/${id}`));\n}',
  ],
  'adv-all-settled': ['async function countResults(urls) {\n  const r = await Promise.all(urls.map((u) => fetch(u)));\n  return { ok: r.length, failed: 0 };\n}'],
  'adv-timeout': [
    'function withTimeout(p, ms) {\n  return p;\n}',
    'function withTimeout(p, ms) {\n  return Promise.race([p, new Promise((done) => setTimeout(done, ms))]);\n}',
  ],
  'adv-retry': [
    'async function retry(action, times) {\n  return action();\n}',
    'async function retry(action, times) {\n  for (let i = 0; i < times; i++) {\n    try {\n      return action();\n    } catch {}\n  }\n}',
    'async function retry(action, times) {\n  let e;\n  for (let i = 0; i <= times; i++) {\n    try {\n      return await action();\n    } catch (err) {\n      e = err;\n    }\n  }\n  throw e;\n}',
  ],
  'adv-promisify': [
    'function promisify(fn) {\n  return (...a) => new Promise((ok) => fn(...a, (e, r) => ok(r)));\n}',
    'function promisify(fn) {\n  return (...a) => new Promise((ok, no) => fn(...a, (e, r) => (r ? ok(r) : no(e))));\n}',
  ],
  'adv-concurrency': [
    'async function runLimited(tasks, limit) {\n  return Promise.all(tasks.map((t) => t()));\n}',
    'async function runLimited(tasks, limit) {\n  const r = [];\n  for (const t of tasks) r.push(await t());\n  return r;\n}',
  ],
  'algo-two-sum': [
    'function twoSum(n, t) {\n  for (let i = 0; i < n.length; i++) {\n    for (let j = i + 1; j < n.length; j++) {\n      if (n[i] + n[j] === t) return [i, j];\n    }\n  }\n  return null;\n}',
    'function twoSum(n, t) {\n  const m = new Map(n.map((v, i) => [v, i]));\n  for (let i = 0; i < n.length; i++) {\n    if (m.has(t - n[i])) return [i, m.get(t - n[i])];\n  }\n  return null;\n}',
  ],
  'algo-binary-search': [
    'function binarySearch(s, t) {\n  return s.indexOf(t);\n}',
    'function binarySearch(s, t) {\n  let l = 0;\n  let h = s.length - 1;\n  while (l < h) {\n    const m = Math.floor((l + h) / 2);\n    if (s[m] === t) return m;\n    if (s[m] < t) l = m + 1;\n    else h = m - 1;\n  }\n  return -1;\n}',
  ],
  'algo-brackets': [
    'function isBalanced(t) {\n  let n = 0;\n  for (const c of t) {\n    if ("([{".includes(c)) n++;\n    if (")]}".includes(c)) n--;\n  }\n  return n === 0;\n}',
    'function isBalanced(t) {\n  const p = { ")": "(", "]": "[", "}": "{" };\n  const s = [];\n  for (const c of t) {\n    if ("([{".includes(c)) s.push(c);\n    else if (c in p && s.pop() !== p[c]) return false;\n  }\n  return true;\n}',
  ],
  'algo-group-by': ['function groupBy(items, key) {\n  const g = {};\n  for (const i of items) g[i[key]] = [i];\n  return g;\n}'],
  'algo-deep-equal': [
    'function deepEqual(a, b) {\n  return JSON.stringify(a) === JSON.stringify(b);\n}',
    'function deepEqual(a, b) {\n  if (a === b) return true;\n  if (typeof a !== "object" || typeof b !== "object") return false;\n  return Object.keys(a).every((k) => deepEqual(a[k], b[k]));\n}',
  ],
  'algo-deep-clone': [
    'function deepClone(v) {\n  return v && typeof v === "object" ? { ...v } : v;\n}',
    'function deepClone(v) {\n  if (typeof v !== "object") return v;\n  const c = {};\n  for (const k of Object.keys(v)) c[k] = deepClone(v[k]);\n  return c;\n}',
  ],
  'algo-event-emitter': [
    'class EventEmitter {\n  constructor() {\n    this.l = {};\n  }\n  on(n, f) {\n    (this.l[n] ??= []).push(f);\n  }\n  off(n, f) {\n    const a = this.l[n];\n    a.splice(a.indexOf(f), 1);\n  }\n  emit(n, ...x) {\n    for (const f of this.l[n] ?? []) f(...x);\n  }\n}',
    'const all = {};\nclass EventEmitter {\n  on(n, f) {\n    all[n] = [...(all[n] ?? []), f];\n  }\n  off(n, f) {\n    all[n] = (all[n] ?? []).filter((x) => x !== f);\n  }\n  emit(n, ...x) {\n    for (const f of all[n] ?? []) f(...x);\n  }\n}',
  ],
  'algo-lru-cache': [
    'class LRUCache {\n  constructor(c) {\n    this.c = c;\n    this.m = new Map();\n  }\n  get(k) {\n    return this.m.get(k);\n  }\n  set(k, v) {\n    this.m.set(k, v);\n    if (this.m.size > this.c) this.m.delete(this.m.keys().next().value);\n  }\n}',
    'class LRUCache {\n  constructor(c) {\n    this.c = c;\n    this.m = new Map();\n  }\n  get(k) {\n    const v = this.m.get(k);\n    if (!v) return v;\n    this.m.delete(k);\n    this.m.set(k, v);\n    return v;\n  }\n  set(k, v) {\n    this.m.delete(k);\n    this.m.set(k, v);\n    if (this.m.size > this.c) this.m.delete(this.m.keys().next().value);\n  }\n}',
  ],
};

export const MASTERY_VALID: Record<string, string[]> = {
  'adv-object-is': ['const isSameValue = (a, b) => (Number.isNaN(a) && Number.isNaN(b)) || (a === b && 1 / a === 1 / b) || (a === b && a !== 0);'],
  'adv-own-keys': ['const ownKeys = (obj) => Object.keys(obj);'],
  'adv-arguments': ['function lastArgument(...args) {\n  return args.at(-1);\n}'],
  'adv-recursion': ['function sumNested(list) {\n  return list.flat(Infinity).reduce((a, b) => a + b, 0);\n}'],
  'adv-bind': ['const timer = { seconds: 5, getSeconds() { return this.seconds; } };\nconst read = () => timer.getSeconds();'],
  'adv-iterator': ['function range(from, to) {\n  return {\n    *[Symbol.iterator]() {\n      for (let i = from; i <= to; i++) yield i;\n    },\n  };\n}'],
  'adv-weakmap': ['const visits = new Map();\nfunction countVisit(user) {\n  visits.set(user, (visits.get(user) ?? 0) + 1);\n  return visits.get(user);\n}'],
  'adv-timeout': ['function withTimeout(promise, ms) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => reject(new Error("Время вышло")), ms);\n    promise.then(resolve, reject);\n  });\n}'],
  'algo-group-by': ['const groupBy = (items, key) => items.reduce((g, i) => ({ ...g, [i[key]]: [...(g[i[key]] ?? []), i] }), {});'],
  'algo-brackets': ['function isBalanced(text) {\n  const s = [];\n  const closes = { "(": ")", "[": "]", "{": "}" };\n  for (const c of text) {\n    if (closes[c]) s.push(closes[c]);\n    else if (")]}".includes(c) && s.pop() !== c) return false;\n  }\n  return !s.length;\n}'],
};
