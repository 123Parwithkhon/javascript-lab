import type { Task, TaskLevel } from '../content/types';

/** Данные, из которых считаются все награды. Сами очки не хранятся, поэтому не расходятся с прогрессом. */
export interface RewardData {
  solved: Record<string, string>;
  /** Задания, решённые без ошибок и подсказок. */
  clean: Record<string, string>;
}

const LEVEL_POINTS: Record<TaskLevel, number> = { easy: 10, medium: 20, hard: 30 };
const CLEAN_BONUS = 5;

/** Пороги рангов в очках. Названия лежат в текстах интерфейса. */
export const RANK_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200] as const;

export function taskPoints(task: Task, clean: boolean): number {
  return LEVEL_POINTS[task.level] + (clean ? CLEAN_BONUS : 0);
}

export function totalPoints(tasks: Task[], data: RewardData): number {
  return tasks
    .filter((task) => data.solved[task.id])
    .reduce((sum, task) => sum + taskPoints(task, Boolean(data.clean[task.id])), 0);
}

export interface RankInfo {
  index: number;
  /** Следующий порог или null, если достигнут последний ранг. */
  nextAt: number | null;
  currentAt: number;
}

export function rankFor(points: number): RankInfo {
  let index = 0;
  RANK_THRESHOLDS.forEach((threshold, position) => {
    if (points >= threshold) index = position;
  });
  return {
    index,
    currentAt: RANK_THRESHOLDS[index] ?? 0,
    nextAt: RANK_THRESHOLDS[index + 1] ?? null,
  };
}

/** Номер календарного дня по местному времени. Не зависит от перехода на летнее время. */
function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

/**
 * Серия дней с решёнными заданиями. Сегодняшний день ещё не потерян: если вчера
 * было решение, а сегодня пока нет, серия продолжается.
 */
export function streaks(isoDates: string[], now: Date): { current: number; best: number } {
  const days = [...new Set(isoDates.map((iso) => dayNumber(new Date(iso))))]
    .filter((day) => Number.isFinite(day))
    .sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of days) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  const today = dayNumber(now);
  const current = previous === today || previous === today - 1 ? run : 0;
  return { current, best };
}

export const ACHIEVEMENT_IDS = [
  'first-task',
  'five-tasks',
  'variables-done',
  'conditions-done',
  'loops-done',
  'functions-done',
  'arrays-done',
  'objects-done',
  'strings-done',
  'closures-done',
  'modern-done',
  'errors-done',
  'async-done',
  'clean-five',
  'clean-hard',
  'streak-three',
  'streak-seven',
  'all-tasks',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

/** Достижения никогда не отнимаются, поэтому для серии берётся лучший результат. */
export function earnedAchievements(tasks: Task[], data: RewardData, now: Date): Set<AchievementId> {
  const solved = tasks.filter((task) => data.solved[task.id]);
  const clean = tasks.filter((task) => data.clean[task.id]);
  const moduleDone = (moduleId: number) =>
    tasks.filter((task) => task.moduleId === moduleId).every((task) => data.solved[task.id]);
  const { best } = streaks(Object.values(data.solved), now);

  const conditions: Record<AchievementId, boolean> = {
    'first-task': solved.length >= 1,
    'five-tasks': solved.length >= 5,
    'variables-done': moduleDone(1),
    'conditions-done': moduleDone(3),
    'loops-done': moduleDone(4),
    'functions-done': moduleDone(5),
    'arrays-done': moduleDone(6),
    'objects-done': moduleDone(7),
    'strings-done': moduleDone(8),
    'closures-done': moduleDone(9),
    'modern-done': moduleDone(10),
    'errors-done': moduleDone(11),
    'async-done': moduleDone(12),
    'clean-five': clean.length >= 5,
    'clean-hard': clean.some((task) => task.level === 'hard'),
    'streak-three': best >= 3,
    'streak-seven': best >= 7,
    'all-tasks': solved.length === tasks.length,
  };

  return new Set(ACHIEVEMENT_IDS.filter((id) => conditions[id]));
}

export interface Reward {
  points: number;
  clean: boolean;
  newAchievements: AchievementId[];
  moduleDone: boolean;
}

/** Что ученик получил за только что решённое задание. Null, если оно уже было решено. */
export function rewardFor(
  task: Task,
  tasks: Task[],
  before: RewardData,
  after: RewardData,
  now: Date,
): Reward | null {
  if (before.solved[task.id] || !after.solved[task.id]) return null;
  const clean = Boolean(after.clean[task.id]);
  const hadBefore = earnedAchievements(tasks, before, now);
  return {
    points: taskPoints(task, clean),
    clean,
    newAchievements: [...earnedAchievements(tasks, after, now)].filter((id) => !hadBefore.has(id)),
    moduleDone: tasks
      .filter((item) => item.moduleId === task.moduleId)
      .every((item) => after.solved[item.id]),
  };
}
