import { useState } from 'react';
import { t } from '../i18n';

/** Попыток до появления кнопки решения. Сначала ученик должен попробовать сам. */
const ATTEMPTS_BEFORE_SOLUTION = 3;

interface HintPanelProps {
  hints: string[];
  solution: string;
  failedAttempts: number;
  onHintShown: () => void;
}

export function HintPanel({ hints, solution, failedAttempts, onHintShown }: HintPanelProps) {
  const [shown, setShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  const allHintsShown = shown >= hints.length;
  const canShowSolution = allHintsShown && failedAttempts >= ATTEMPTS_BEFORE_SOLUTION;

  return (
    <section className="hints" aria-label={t.task.hintsTitle}>
      {hints.slice(0, shown).map((hint, index) => (
        <p key={hint} className="hints__item">
          <b>{index + 1}.</b> {hint}
        </p>
      ))}
      {!allHintsShown && (
        <button
          type="button"
          className="button"
          onClick={() => {
            setShown(shown + 1);
            onHintShown();
          }}
        >
          {t.task.showHint(shown + 1, hints.length)}
        </button>
      )}
      {canShowSolution && !solutionShown && (
        <button type="button" className="button" onClick={() => setSolutionShown(true)}>
          {t.task.showSolution}
        </button>
      )}
      {solutionShown && <pre className="code-block">{solution}</pre>}
    </section>
  );
}
