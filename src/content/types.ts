import type { JsonValue } from '../sandbox/types';

export type TaskLevel = 'easy' | 'medium' | 'hard';

/** Вызов функции ученика: платформа передаёт аргументы и сверяет результат return. */
export interface TaskCall {
  name: string;
  args: JsonValue[];
  expected: JsonValue | undefined;
}

/**
 * Выражение, которое платформа вычисляет после программы. Нужно для проверок,
 * где одного вызова мало: замыкания, классы, ошибки.
 */
export interface TaskCheck {
  /** Подпись для ученика вместо самого выражения. */
  label: string;
  expression: string;
  expected: JsonValue | undefined;
}

/**
 * Один запуск программы при проверке. Если задача зависит от входных данных,
 * у неё несколько случаев: решение, подогнанное под один ответ, их не пройдёт.
 */
export interface TaskCase {
  /** Что проверяется. Ученик увидит эту подпись, если случай не пройден. */
  label: string;
  /** Значения, которые платформа передаёт программе. */
  givens?: Record<string, JsonValue>;
  /** Строки, которые программа должна вывести, точно и по порядку. Если не заданы, вывод не проверяется. */
  output?: string[];
  /** Переменные и их значения после выполнения. Значение может быть undefined. */
  variables?: Record<string, JsonValue | undefined>;
  /** Вызовы функций после выполнения программы. */
  calls?: TaskCall[];
  /** Выражения для проверки. Вычисляются по порядку и видят результат предыдущих. */
  checks?: TaskCheck[];
}

export interface Task {
  /** Постоянный идентификатор: по нему хранится прогресс, менять его нельзя. */
  id: string;
  moduleId: number;
  topic: string;
  level: TaskLevel;
  title: string;
  /** Короткая теория: всё, что нужно знать для решения. */
  theory: string;
  /** Необязательный пример кода к теории. */
  example?: string;
  description: string;
  /** Служебный код перед программой ученика, например учебный fetch. */
  setup?: string;
  initialCode: string;
  cases: [TaskCase, ...TaskCase[]];
  /** От общего намёка к конкретному. Полного решения здесь быть не должно. */
  hints: string[];
  solution: string;
  explanation: string;
}
