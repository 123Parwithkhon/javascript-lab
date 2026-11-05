import type { Task } from '../types';

export const module3Tasks: Task[] = [
  {
    id: 'if-positive',
    moduleId: 3,
    topic: 'if',
    level: 'easy',
    title: 'Условие if',
    theory:
      'if выполняет блок кода, только если условие истинно. Если условие ложно, блок пропускается, и программа идёт дальше.',
    example: 'const balance = 100;\nif (balance > 50) {\n  console.log("Хватает");\n}',
    description: 'Выведите «Есть долг», только если balance меньше нуля. В остальных случаях программа ничего не выводит.',
    initialCode: '// Переменная balance уже существует\n',
    cases: [
      { label: 'balance = -10', givens: { balance: -10 }, output: ['Есть долг'] },
      { label: 'balance = 100', givens: { balance: 100 }, output: [] },
      { label: 'balance = 0 (ноль не долг)', givens: { balance: 0 }, output: [] },
    ],
    hints: ['Запись начинается так: if (условие) { ... }', 'Условие: balance < 0.'],
    solution: 'if (balance < 0) {\n  console.log("Есть долг");\n}\n',
    explanation:
      'Блок выполняется только при истинном условии, а без него программа просто ничего не делает. Ноль не считается долгом, поэтому здесь нужен строгий знак <.',
  },
  {
    id: 'if-else',
    moduleId: 3,
    topic: 'else',
    level: 'easy',
    title: 'Один из двух вариантов',
    theory:
      'else задаёт, что делать, если условие в if ложно. Всегда выполняется ровно один из двух блоков.',
    example: 'if (isOpen) {\n  console.log("Открыто");\n} else {\n  console.log("Закрыто");\n}',
    description:
      'Выведите «Жарко», если temperature равна 25 или больше, а иначе выведите «Прохладно».',
    initialCode: '// Переменная temperature уже существует\n',
    cases: [
      { label: 'temperature = 30', givens: { temperature: 30 }, output: ['Жарко'] },
      { label: 'temperature = 25 (граница)', givens: { temperature: 25 }, output: ['Жарко'] },
      { label: 'temperature = 24', givens: { temperature: 24 }, output: ['Прохладно'] },
      { label: 'temperature = -5', givens: { temperature: -5 }, output: ['Прохладно'] },
    ],
    hints: ['Нужны if и else.', '«25 или больше» записывается как >= 25.'],
    solution: 'if (temperature >= 25) {\n  console.log("Жарко");\n} else {\n  console.log("Прохладно");\n}\n',
    explanation:
      'При любом значении сработал ровно один блок. Проверка 25 подтвердила, что граница попала в нужную ветку.',
  },
  {
    id: 'else-if-grade',
    moduleId: 3,
    topic: 'else if',
    level: 'hard',
    title: 'Оценка за экзамен',
    theory:
      'else if добавляет ещё одно условие. Условия проверяются сверху вниз, и выполняется только первый подходящий блок. Поэтому важен их порядок.',
    example: 'if (speed > 100) {\n  console.log("Быстро");\n} else if (speed > 50) {\n  console.log("Средне");\n} else {\n  console.log("Медленно");\n}',
    description:
      'По баллам score выведите оценку: от 90 — «Отлично», от 70 — «Хорошо», от 50 — «Удовлетворительно», ниже — «Нужно повторить».',
    initialCode: '// Переменная score уже существует\n',
    cases: [
      { label: 'score = 100', givens: { score: 100 }, output: ['Отлично'] },
      { label: 'score = 90 (граница)', givens: { score: 90 }, output: ['Отлично'] },
      { label: 'score = 89', givens: { score: 89 }, output: ['Хорошо'] },
      { label: 'score = 70 (граница)', givens: { score: 70 }, output: ['Хорошо'] },
      { label: 'score = 69', givens: { score: 69 }, output: ['Удовлетворительно'] },
      { label: 'score = 50 (граница)', givens: { score: 50 }, output: ['Удовлетворительно'] },
      { label: 'score = 49', givens: { score: 49 }, output: ['Нужно повторить'] },
      { label: 'score = 0', givens: { score: 0 }, output: ['Нужно повторить'] },
    ],
    hints: [
      'Понадобятся if, два else if и else.',
      'Начните с самого высокого порога: 90.',
      'Если первым проверить score >= 50, то 100 баллов дадут «Удовлетворительно».',
    ],
    solution:
      'if (score >= 90) {\n  console.log("Отлично");\n} else if (score >= 70) {\n  console.log("Хорошо");\n} else if (score >= 50) {\n  console.log("Удовлетворительно");\n} else {\n  console.log("Нужно повторить");\n}\n',
    explanation:
      'Как только условие сработало, остальные не проверяются. Поэтому во второй проверке не нужно писать score < 90: туда попадают только значения ниже 90.',
  },
];
