/** Неверные и другие верные решения для заданий со страницей и итоговых проектов. */
export const DOM_WRONG: Record<string, string[]> = {
  'dom-text': ['document.querySelector("#title").textContent = "Салом";', 'console.log("Салом, мир!");'],
  'dom-count': ['console.log(3);', 'console.log(document.querySelectorAll("ul").length);'],
  'dom-classes': [
    'document.querySelector("#message").classList.add("success");',
    'document.querySelector("#message").className = "hidden success";',
  ],
  'dom-attributes': ['document.querySelector("#docs").setAttribute("href", "https://developer.mozilla.org");'],
  'dom-click-counter': [
    'let count = 0;\ndocument.querySelector("#add").addEventListener("click", () => {\n  document.querySelector("#count").textContent = count + 1;\n});',
    'document.querySelector("#count").textContent = 1;',
  ],
  'dom-input': [
    'const f = document.querySelector("#name");\nf.addEventListener("input", () => {\n  document.querySelector("#greeting").textContent = `Салом, ${f.value}!`;\n});',
    'document.querySelector("#greeting").textContent = "Салом, Parviz!";',
  ],
  'dom-create': [
    'const f = document.querySelector("#text");\ndocument.querySelector("#add").addEventListener("click", () => {\n  const li = document.createElement("li");\n  li.textContent = f.value;\n  document.querySelector("#list").append(li);\n  f.value = "";\n});',
    'const f = document.querySelector("#text");\ndocument.querySelector("#add").addEventListener("click", () => {\n  if (f.value === "") return;\n  document.querySelector("#list").innerHTML += `<li>${f.value}</li>`;\n  f.value = "";\n});',
  ],
  'dom-delegation': [
    'for (const b of document.querySelectorAll(".remove")) {\n  b.addEventListener("click", () => b.closest("li").remove());\n}',
    'document.querySelector("#list").addEventListener("click", (e) => {\n  e.target.closest("li").remove();\n});',
  ],
  'dom-form': [
    'document.querySelector("#form").addEventListener("submit", () => {\n  document.querySelector("#error").textContent = "Неверный адрес";\n});',
    'document.querySelector("#form").addEventListener("submit", (e) => {\n  e.preventDefault();\n  document.querySelector("#result").textContent = "Отправлено";\n});',
  ],
  'dom-storage': [
    'let n = 0;\nconst o = document.querySelector("#visits");\no.textContent = n;\ndocument.querySelector("#add").addEventListener("click", () => {\n  n++;\n  o.textContent = n;\n});',
    'let n = localStorage.getItem("visits") ?? 0;\nconst o = document.querySelector("#visits");\no.textContent = n;\ndocument.querySelector("#add").addEventListener("click", () => {\n  n = n + 1;\n  localStorage.setItem("visits", n);\n  o.textContent = n;\n});',
  ],
  'project-calculator': [
    'document.querySelector("#calc").addEventListener("click", () => {\n  const a = document.querySelector("#a").value;\n  const b = document.querySelector("#b").value;\n  document.querySelector("#result").textContent = a + b;\n});',
    'document.querySelector("#calc").addEventListener("click", () => {\n  const a = Number(document.querySelector("#a").value);\n  const b = Number(document.querySelector("#b").value);\n  document.querySelector("#result").textContent = a + b;\n});',
  ],
  'project-todo': [
    'const f = document.querySelector("#text");\ndocument.querySelector("#add").addEventListener("click", () => {\n  const li = document.createElement("li");\n  li.innerHTML = `<span class="title">${f.value}</span>`;\n  document.querySelector("#list").append(li);\n  f.value = "";\n});',
  ],
  'project-expenses': [
    'document.querySelector("#form").addEventListener("submit", (e) => {\n  e.preventDefault();\n  const li = document.createElement("li");\n  li.textContent = document.querySelector("#title").value + ": " + document.querySelector("#amount").value;\n  document.querySelector("#list").append(li);\n});',
  ],
  'project-quiz': [
    'document.querySelector("#question").textContent = questions[0].text;',
    'let i = 0;\nfunction show() {\n  const q = questions[i];\n  document.querySelector("#question").textContent = q.text;\n  const box = document.querySelector("#options");\n  box.replaceChildren();\n  q.options.forEach((o) => {\n    const b = document.createElement("button");\n    b.className = "option";\n    b.textContent = o;\n    b.onclick = () => { i++; if (i < questions.length) show(); };\n    box.append(b);\n  });\n}\nshow();',
  ],
  'project-search': [
    'document.querySelector("#search").addEventListener("click", async () => {\n  const r = await fetch("/products");\n  const p = await r.json();\n  for (const x of p) {\n    const li = document.createElement("li");\n    li.textContent = x.title;\n    document.querySelector("#results").append(li);\n  }\n});',
  ],
};

export const DOM_VALID: Record<string, string[]> = {
  'dom-text': ['document.getElementById("title").innerText = "Салом, мир!";\ndocument.getElementById("title").textContent = "Салом, мир!";'],
  'dom-classes': ['const m = document.querySelector("#message");\nm.className = "success";'],
  'dom-attributes': ['const a = document.querySelector("#docs");\na.href = "https://developer.mozilla.org";\na.target = "_blank";'],
  'dom-click-counter': ['const o = document.querySelector("#count");\ndocument.querySelector("#add").onclick = () => {\n  o.textContent = Number(o.textContent) + 1;\n};'],
};
