import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { runCode } from '../sandbox/runner';
import type { OutputLine, RunHandle, RunResult } from '../sandbox/types';
import { CodeEditor } from './CodeEditor';
import { ConsoleOutput } from './ConsoleOutput';

interface CodeRunnerProps {
  initialCode: string;
}

/** Редактор, кнопки и консоль. На странице задания сюда добавится проверка решения. */
export function CodeRunner({ initialCode }: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const handleRef = useRef<RunHandle | null>(null);

  useEffect(() => () => handleRef.current?.stop(), []);

  useEffect(() => {
    handleRef.current?.stop();
    setCode(initialCode);
    setLines([]);
    setResult(null);
  }, [initialCode]);

  const run = useCallback(async () => {
    handleRef.current?.stop();
    setLines([]);
    setResult(null);
    setRunning(true);
    const handle = runCode(code, (chunk) => setLines((current) => [...current, ...chunk]));
    handleRef.current = handle;
    const outcome = await handle.result;
    if (handleRef.current !== handle) return; // Уже начат новый запуск.
    handleRef.current = null;
    setResult(outcome);
    setRunning(false);
  }, [code]);

  const clear = () => {
    setLines([]);
    setResult(null);
  };

  return (
    <section className="runner">
      <CodeEditor value={code} onChange={setCode} label={t.runner.editorLabel} />
      <div className="runner__actions">
        {running ? (
          <button type="button" className="button button--danger" onClick={() => handleRef.current?.stop()}>
            {t.runner.stop}
          </button>
        ) : (
          <button type="button" className="button button--primary" onClick={() => void run()}>
            ▶ {t.runner.run}
          </button>
        )}
        <button type="button" className="button" onClick={() => setCode(initialCode)}>
          {t.runner.reset}
        </button>
        <button type="button" className="button" onClick={clear}>
          {t.runner.clear}
        </button>
      </div>
      <ConsoleOutput lines={lines} result={result} running={running} />
    </section>
  );
}
