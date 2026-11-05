import type { TaskLevel } from '../types';

export interface LessonLine {
  /** Фрагмент из примера кода. Тесты проверяют, что он там действительно есть. */
  code: string;
  note: string;
}

/** Урок проходит путь: объяснение → жизненный пример → код → разбор → опыт → практика → итог. */
export interface Lesson {
  /** Постоянный адрес и ключ прогресса: менять его нельзя. */
  slug: string;
  moduleId: number;
  level: TaskLevel;
  title: string;
  /** Одно предложение для карточки в списке. */
  summary: string;
  /** Объяснение простыми словами, по абзацам. */
  explanation: string[];
  analogy: string;
  code: string;
  /** Служебный код перед примерами, например учебный fetch. */
  setup?: string;
  /** Что выводит пример. Тесты запускают код и сверяют результат. */
  output: string[];
  lines: LessonLine[];
  /** Что попробовать изменить в интерактивном примере. */
  tryPrompt: string;
  tryCode: string;
  recap: string[];
}
