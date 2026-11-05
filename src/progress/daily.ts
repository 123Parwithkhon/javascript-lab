import type { Task } from '../content/types';

/** Номер календарного дня по местному времени. */
function dayIndex(now: Date): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

/**
 * Задание дня: одно из решённых, чтобы повторение не давало забыть тему.
 * Весь день оно одно и то же. Пока решено меньше трёх заданий, повторять рано.
 */
export function dailyTask(tasks: Task[], solved: Record<string, string>, now: Date): Task | undefined {
  const done = tasks.filter((task) => solved[task.id]);
  if (done.length < 3) return undefined;
  return done[dayIndex(now) % done.length];
}
