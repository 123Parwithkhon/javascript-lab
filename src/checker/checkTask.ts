import type { Task, TaskCase } from '../content/types';
import { runCode } from '../sandbox/runner';
import type { OutputLine, RunHandle, RunResult } from '../sandbox/types';
import { evaluateCase, type CaseFailure } from './evaluate';

export type CheckResult =
  | { status: 'passed'; total: number }
  | {
      status: 'failed';
      total: number;
      failedIndex: number;
      taskCase: TaskCase;
      failure: CaseFailure;
    }
  | {
      status: 'run-failed';
      total: number;
      failedIndex: number;
      taskCase: TaskCase;
      run: Exclude<RunResult, { status: 'success' }>;
    }
  | { status: 'stopped' };

export interface CheckHandle {
  result: Promise<CheckResult>;
  stop: () => void;
}

/**
 * Запускает решение отдельно на каждом случае и останавливается на первой ошибке.
 * Каждый случай получает новую песочницу, поэтому запуски не влияют друг на друга.
 *
 * Проверка идёт в браузере, поэтому её результат подтверждает прогресс только
 * для самого ученика. Рейтинг и сертификаты требуют проверки на сервере.
 */
export function checkTask(task: Task, code: string): CheckHandle {
  let current: RunHandle | null = null;
  let stopped = false;

  const execute = async (): Promise<CheckResult> => {
    const total = task.cases.length;

    for (const [failedIndex, taskCase] of task.cases.entries()) {
      if (stopped) return { status: 'stopped' };

      const output: OutputLine[] = [];
      current = runCode(code, (lines) => output.push(...lines), {
        setup: task.setup ?? '',
        globals: taskCase.givens ?? {},
        probe: Object.keys(taskCase.variables ?? {}),
        calls: taskCase.calls ?? [],
        expressions: (taskCase.checks ?? []).map((check) => check.expression),
      });
      const run = await current.result;

      if (run.status === 'stopped') return { status: 'stopped' };
      if (run.status !== 'success') {
        return { status: 'run-failed', total, failedIndex, taskCase, run };
      }
      const failure = evaluateCase(taskCase, output, run.probe);
      if (failure) return { status: 'failed', total, failedIndex, taskCase, failure };
    }

    return { status: 'passed', total };
  };

  return {
    result: execute(),
    stop: () => {
      stopped = true;
      current?.stop();
    },
  };
}
