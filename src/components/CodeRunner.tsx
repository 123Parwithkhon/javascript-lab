import { useEffect, useRef, useState, type ReactNode } from 'react';
import { t } from '../i18n';
import { runCode } from '../sandbox/runner';
import type { JsonValue, OutputLine, Pixel, RunHandle, RunResult } from '../sandbox/types';
import { CodeEditor } from './CodeEditor';
import { ConsoleOutput } from './ConsoleOutput';
import { PixelCanvas } from './PixelCanvas';

interface CodeRunnerProps {
  /** Код, к которому возвращает кнопка сброса. */
  initialCode: string;
  /** Код при открытии, например сохранённый черновик. */
  startCode?: string;
  /** Значения, которые получает программа при запуске. */
  givens?: Record<string, JsonValue>;
  /** Служебный код перед программой. */
  setup?: string;
  onCodeChange?: (code: string) => void;
  /** Дополнительные кнопки. Получают текущий код. */
  renderActions?: (code: string) => ReactNode;
  /** Запрещает запуск, пока идёт другая операция, например проверка. */
  busy?: boolean;
}

/**
 * Редактор, кнопки и консоль. Чтобы начать с другим кодом, компонент
 * пересоздают через свойство key.
 */
export function CodeRunner({
  initialCode,
  startCode,
  givens,
  setup,
  onCodeChange,
  renderActions,
  busy = false,
}: CodeRunnerProps) {
  const [code, setCode] = useState(startCode ?? initialCode);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const handleRef = useRef<RunHandle | null>(null);

  useEffect(() => () => handleRef.current?.stop(), []);

  const changeCode = (next: string) => {
    setCode(next);
    onCodeChange?.(next);
  };

  const run = async () => {
    handleRef.current?.stop();
    setLines([]);
    setPixels([]);
    setResult(null);
    setRunning(true);
    const handle = runCode(code, (chunk) => setLines((current) => [...current, ...chunk]), {
      globals: givens ?? {},
      setup: setup ?? '',
      onPixels: (chunk) => setPixels((current) => [...current, ...chunk]),
    });
    handleRef.current = handle;
    const outcome = await handle.result;
    if (handleRef.current !== handle) return; // Уже начат новый запуск.
    handleRef.current = null;
    setResult(outcome);
    setRunning(false);
  };

  const clear = () => {
    setLines([]);
    setPixels([]);
    setResult(null);
  };

  return (
    <section className="runner">
      <CodeEditor value={code} onChange={changeCode} label={t.runner.editorLabel} />
      <div className="runner__actions">
        {running ? (
          <button
            type="button"
            className="button button--danger"
            onClick={() => handleRef.current?.stop()}
          >
            {t.runner.stop}
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            disabled={busy}
            onClick={() => void run()}
          >
            ▶ {t.runner.run}
          </button>
        )}
        {renderActions?.(code)}
        <button type="button" className="button" onClick={() => changeCode(initialCode)}>
          {t.runner.reset}
        </button>
        <button type="button" className="button" onClick={clear}>
          {t.runner.clear}
        </button>
      </div>
      <ConsoleOutput lines={lines} result={result} running={running} drew={pixels.length > 0} />
      {pixels.length > 0 && <PixelCanvas pixels={pixels} />}
    </section>
  );
}
