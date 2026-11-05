import type { Task } from '../content/types';

/**
 * Внутри модуля задания открываются по порядку, а первое задание модуля открыто
 * всегда. Так новичок идёт от простого к сложному, а тот, кто уже знает тему,
 * может перейти к следующему модулю.
 */
export function isUnlocked(task: Task, tasks: Task[], solved: Record<string, string>): boolean {
  const moduleTasks = tasks.filter((item) => item.moduleId === task.moduleId);
  const index = moduleTasks.indexOf(task);
  if (index <= 0) return true;
  const previous = moduleTasks[index - 1];
  return previous !== undefined && Boolean(solved[previous.id]);
}

/** Первое нерешённое задание: его и рекомендуем. */
export function recommendedTask(tasks: Task[], solved: Record<string, string>): Task | undefined {
  return tasks.find((task) => !solved[task.id]);
}
