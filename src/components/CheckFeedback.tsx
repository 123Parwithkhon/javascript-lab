import type { CheckResult } from '../checker/checkTask';
import { diagnose } from '../checker/diagnose';
import type { CaseFailure } from '../checker/evaluate';
import { t } from '../i18n';
import { RunStatus } from './ConsoleOutput';

function formatLines(lines: string[]): string {
  return lines.length === 0 ? t.task.noOutput : lines.join('\n');
}

function FailureDetails({ failure }: { failure: CaseFailure }) {
  switch (failure.kind) {
    case 'missing-variable':
      return <p>{t.task.missingVariable(failure.name)}</p>;
    case 'wrong-variable':
      return (
        <>
          <p>{t.task.wrongVariable(failure.name)}</p>
          <Comparison expected={failure.expected} actual={failure.actual} />
        </>
      );
    case 'missing-function':
      return <p>{t.task.missingFunction(failure.name)}</p>;
    case 'call-threw':
      return <p>{t.task.callThrew(failure.call, failure.message)}</p>;
    case 'wrong-return':
      return (
        <>
          <p>{failure.actual === 'undefined' ? t.task.noReturn(failure.call) : t.task.wrongReturn(failure.call)}</p>
          <Comparison expected={failure.expected} actual={failure.actual} />
        </>
      );
    case 'wrong-output':
      return (
        <Comparison expected={formatLines(failure.expected)} actual={formatLines(failure.actual)} />
      );
  }
}

function Comparison({ expected, actual }: { expected: string; actual: string }) {
  return (
    <dl className="comparison">
      <div>
        <dt>{t.task.expected}</dt>
        <dd>
          <pre>{expected}</pre>
        </dd>
      </div>
      <div>
        <dt>{t.task.actual}</dt>
        <dd>
          <pre>{actual}</pre>
        </dd>
      </div>
    </dl>
  );
}

function Diagnosis({ failure }: { failure: CaseFailure }) {
  const kind = diagnose(failure);
  if (!kind) return null;
  return <p className="diagnosis">💡 {t.diagnosis[kind]}</p>;
}

/** Сообщает, что не так. Само решение здесь не раскрывается. */
export function CheckFeedback({ result }: { result: CheckResult }) {
  if (result.status === 'stopped') {
    return (
      <div className="feedback" role="status">
        {t.task.checkStopped}
      </div>
    );
  }
  if (result.status === 'passed') return null;

  return (
    <div className="feedback feedback--error" role="status">
      <h2>{t.task.notYet}</h2>
      <p>
        {t.task.caseFailed(result.failedIndex + 1, result.total)} <b>{result.taskCase.label}</b>
      </p>
      {result.status === 'failed' ? (
        <>
          <FailureDetails failure={result.failure} />
          <Diagnosis failure={result.failure} />
        </>
      ) : (
        <div className="feedback__run">
          <RunStatus result={result.run} hasOutput={false} />
        </div>
      )}
    </div>
  );
}
