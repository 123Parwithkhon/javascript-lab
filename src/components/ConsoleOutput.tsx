import { t } from '../i18n';
import type { OutputLine, RunResult } from '../sandbox/types';

interface ConsoleOutputProps {
  lines: OutputLine[];
  result: RunResult | null;
  running: boolean;
  /** Программа что-то нарисовала: это тоже результат, хотя в консоли пусто. */
  drew?: boolean;
}

export function RunStatus({ result, hasOutput }: { result: RunResult; hasOutput: boolean }) {
  switch (result.status) {
    case 'success':
      return (
        <p className="status status--success">
          ✓ {hasOutput ? t.runner.success : t.runner.successNoOutput}
        </p>
      );
    case 'error': {
      const { name, message, line } = result.error;
      return (
        <div className="status status--error">
          <p className="status__code">
            {name}: {message}
            {line !== null && ` (${t.runner.errorAtLine.toLowerCase()} ${line})`}
          </p>
          <p>{t.errorHints[name] ?? t.errorHintDefault}</p>
        </div>
      );
    }
    case 'timeout':
      return <p className="status status--error">{t.runner.timeout}</p>;
    case 'output-limit':
      return <p className="status status--error">{t.runner.outputLimit}</p>;
    case 'code-too-large':
      return <p className="status status--error">{t.runner.codeTooLarge}</p>;
    case 'sandbox-failed':
      return <p className="status status--error">{t.runner.sandboxFailed}</p>;
    case 'stopped':
      return <p className="status">{t.runner.stopped}</p>;
  }
}

export function ConsoleOutput({ lines, result, running, drew = false }: ConsoleOutputProps) {
  const isEmpty = lines.length === 0 && !result && !running;

  return (
    <div className="console" role="region" aria-label={t.runner.consoleLabel}>
      <div className="console__title">{t.runner.consoleLabel}</div>
      <div className="console__body" aria-live="polite">
        {isEmpty && <p className="console__placeholder">{t.runner.empty}</p>}
        {lines.map((line, index) => (
          <pre key={index} className={`console__line console__line--${line.level}`}>
            {line.text}
          </pre>
        ))}
        {running && <p className="status">{t.runner.running}</p>}
        {result && <RunStatus result={result} hasOutput={lines.length > 0 || drew} />}
      </div>
    </div>
  );
}
