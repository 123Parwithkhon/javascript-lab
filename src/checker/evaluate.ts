import type { TaskCase } from '../content/types';
import type { OutputLine, ProbeValues } from '../sandbox/types';

export type CaseFailure =
  | { kind: 'missing-variable'; name: string }
  | { kind: 'wrong-variable'; name: string; expected: string; actual: string }
  | { kind: 'wrong-output'; expected: string[]; actual: string[] }
  | { kind: 'missing-function'; name: string }
  | { kind: 'call-threw'; call: string; message: string }
  | { kind: 'wrong-return'; call: string; expected: string; actual: string };

/** Ключ результата вызова функции в данных из песочницы. */
export function callKey(index: number): string {
  return `call:${index}`;
}

/** Ключ результата выражения в данных из песочницы. */
export function expressionKey(index: number): string {
  return `expr:${index}`;
}

/** Префикс результата, если вызов функции завершился ошибкой. */
export const THROW_PREFIX = 'throw:';

/** Сортирует ключи, как canonical в песочнице: порядок свойств не влияет на сравнение. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value === null || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) sorted[key] = canonical(source[key]);
  return sorted;
}

/** То же представление значения, что и у serialize в песочнице. */
export function serializeExpected(value: unknown): string {
  return value === undefined ? 'undefined' : JSON.stringify(canonical(value));
}

/** Разбивает вывод на строки, чтобы console.log("a\nb") и два вызова считались одинаково. */
function toLines(output: OutputLine[]): string[] {
  return output.flatMap((line) => line.text.split('\n')).map((line) => line.trimEnd());
}

function evaluateCalls(taskCase: TaskCase, probe: ProbeValues): CaseFailure | null {
  for (const [index, call] of (taskCase.calls ?? []).entries()) {
    const actual = probe[callKey(index)] ?? null;
    if (actual === null) return { kind: 'missing-function', name: call.name };

    const text = `${call.name}(${call.args.map((arg) => JSON.stringify(arg)).join(', ')})`;
    if (actual.startsWith(THROW_PREFIX)) {
      return { kind: 'call-threw', call: text, message: actual.slice(THROW_PREFIX.length) };
    }
    const expected = serializeExpected(call.expected);
    if (actual !== expected) return { kind: 'wrong-return', call: text, expected, actual };
  }
  return null;
}

function evaluateChecks(taskCase: TaskCase, probe: ProbeValues): CaseFailure | null {
  for (const [index, check] of (taskCase.checks ?? []).entries()) {
    const actual = probe[expressionKey(index)] ?? 'undefined';
    if (actual.startsWith(THROW_PREFIX)) {
      return { kind: 'call-threw', call: check.label, message: actual.slice(THROW_PREFIX.length) };
    }
    const expected = serializeExpected(check.expected);
    if (actual !== expected) return { kind: 'wrong-return', call: check.label, expected, actual };
  }
  return null;
}

/** Сравнивает итог запуска с ожиданием. Возвращает null, если случай пройден. */
export function evaluateCase(
  taskCase: TaskCase,
  output: OutputLine[],
  probe: ProbeValues,
): CaseFailure | null {
  for (const [name, expectedValue] of Object.entries(taskCase.variables ?? {})) {
    const actual = probe[name] ?? null;
    if (actual === null) return { kind: 'missing-variable', name };
    const expected = serializeExpected(expectedValue);
    if (actual !== expected) return { kind: 'wrong-variable', name, expected, actual };
  }

  const callFailure = evaluateCalls(taskCase, probe);
  if (callFailure) return callFailure;

  const checkFailure = evaluateChecks(taskCase, probe);
  if (checkFailure) return checkFailure;

  // В задачах на функции вывод не проверяем: ученик может отлаживать код через console.log.
  if (!taskCase.output) return null;
  const actualLines = toLines(output);
  const same =
    actualLines.length === taskCase.output.length &&
    actualLines.every((line, index) => line === taskCase.output?.[index]);
  return same ? null : { kind: 'wrong-output', expected: taskCase.output, actual: actualLines };
}
