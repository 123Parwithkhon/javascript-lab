import type { CaseFailure } from './evaluate';

export type Diagnosis =
  | 'string-instead-of-number'
  | 'number-instead-of-string'
  | 'wrong-order'
  | 'case-differs'
  | 'spacing-differs'
  | 'punctuation-differs'
  | 'no-output'
  | 'one-line-extra'
  | 'one-line-missing';

const onlyLetters = (text: string) => text.replace(/[\s.,!?;:«»"'-]/g, '');

function diagnoseValue(expected: string, actual: string): Diagnosis | null {
  // Значения сериализованы: "5" со строкой хранится в кавычках, а число без них.
  if (actual === JSON.stringify(expected)) return 'string-instead-of-number';
  if (expected === JSON.stringify(actual)) return 'number-instead-of-string';
  return diagnoseText(expected, actual);
}

function diagnoseText(expected: string, actual: string): Diagnosis | null {
  if (expected === actual) return null;
  if (expected.toLowerCase() === actual.toLowerCase()) return 'case-differs';
  if (expected.replace(/\s/g, '') === actual.replace(/\s/g, '')) return 'spacing-differs';
  if (onlyLetters(expected).toLowerCase() === onlyLetters(actual).toLowerCase()) return 'punctuation-differs';
  return null;
}

function diagnoseOutput(expected: string[], actual: string[]): Diagnosis | null {
  if (actual.length === 0 && expected.length > 0) return 'no-output';

  if (actual.length === expected.length) {
    if ([...actual].sort().join('\n') === [...expected].sort().join('\n')) return 'wrong-order';
    return diagnoseText(expected.join('\n'), actual.join('\n'));
  }

  const startsTheSame = (long: string[], short: string[]) => short.every((line, index) => line === long[index]);
  if (actual.length === expected.length + 1 && startsTheSame(actual, expected)) return 'one-line-extra';
  if (actual.length === expected.length - 1 && startsTheSame(expected, actual)) return 'one-line-missing';
  return null;
}

/** Определяет типичную ошибку. Если причина неясна, возвращает null: лучше промолчать, чем угадать. */
export function diagnose(failure: CaseFailure): Diagnosis | null {
  switch (failure.kind) {
    case 'wrong-output':
      return diagnoseOutput(failure.expected, failure.actual);
    case 'wrong-variable':
    case 'wrong-return':
      return diagnoseValue(failure.expected, failure.actual);
    default:
      return null;
  }
}
