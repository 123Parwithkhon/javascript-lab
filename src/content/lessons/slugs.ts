/**
 * Адреса уроков по номеру модуля. Лежат отдельно, чтобы главной странице
 * не приходилось загружать тексты всех уроков. Совпадение проверяют тесты.
 */
export const LESSON_SLUGS: Record<number, string> = {
  0: 'first-program',
  1: 'variables',
  2: 'operators',
  3: 'conditions',
  4: 'loops',
  5: 'functions',
  6: 'arrays',
  7: 'objects',
  8: 'strings-numbers-dates',
  9: 'scope-closures',
  10: 'modern-js',
  11: 'errors',
  12: 'async',
  13: 'dom',
  14: 'projects',
  15: 'advanced-types',
  16: 'advanced-functions',
  17: 'advanced-async',
  18: 'algorithms',
};
