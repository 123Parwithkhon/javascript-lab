import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'jslab.progress.v1';

export interface Progress {
  /** Решённые задания: идентификатор и дата решения в формате ISO. */
  solved: Record<string, string>;
  /** Задания, решённые с первой попытки и без подсказок. */
  clean: Record<string, string>;
  /** Пройденные уроки: адрес и дата. */
  lessons: Record<string, string>;
  /** Черновики кода, чтобы обновление страницы не стирало работу. */
  drafts: Record<string, string>;
}

const EMPTY: Progress = { solved: {}, clean: {}, lessons: {}, drafts: {} };

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

/** Данные из localStorage могут быть повреждены, поэтому проверяем их форму. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return EMPTY;
    const { solved, clean, lessons, drafts } = data as Record<string, unknown>;
    return {
      solved: isStringRecord(solved) ? solved : {},
      clean: isStringRecord(clean) ? clean : {},
      lessons: isStringRecord(lessons) ? lessons : {},
      drafts: isStringRecord(drafts) ? drafts : {},
    };
  } catch {
    return EMPTY;
  }
}

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY));
  } catch {
    return EMPTY; // Хранилище запрещено, например в приватном режиме.
  }
}

let state = load();
const listeners = new Set<() => void>();

function update(next: Progress) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Хранилище недоступно или заполнено: прогресс остаётся до закрытия вкладки.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Другая вкладка изменила прогресс: показываем актуальные данные и здесь.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  state = load();
  listeners.forEach((listener) => listener());
});

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state);
}

export function getProgress(): Progress {
  return state;
}

export function markSolved(taskId: string, clean: boolean) {
  if (state.solved[taskId]) return;
  const date = new Date().toISOString();
  update({
    ...state,
    solved: { ...state.solved, [taskId]: date },
    clean: clean ? { ...state.clean, [taskId]: date } : state.clean,
  });
}

export function markLessonRead(slug: string) {
  if (state.lessons[slug]) return;
  update({ ...state, lessons: { ...state.lessons, [slug]: new Date().toISOString() } });
}

export function saveDraft(taskId: string, code: string) {
  if (state.drafts[taskId] === code) return;
  update({ ...state, drafts: { ...state.drafts, [taskId]: code } });
}
