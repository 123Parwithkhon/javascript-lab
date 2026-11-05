import { useState } from 'react';
import type { LessonQuiz } from '../content/lessons/quizzes';
import { t } from '../i18n';

/** Сначала ученик предсказывает результат: так лучше видно, что он понял на самом деле. */
export function QuizBlock({ quiz }: { quiz: LessonQuiz }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const isCorrect = chosen === quiz.answer;

  return (
    <section className="quiz">
      <h2>{t.quiz.title}</h2>
      <p>{t.quiz.prompt}</p>
      <pre className="code-block">{quiz.code}</pre>
      <div className="quiz__options" role="group" aria-label={t.quiz.title}>
        {quiz.options.map((option, index) => {
          const state =
            chosen === null
              ? ''
              : index === quiz.answer
                ? 'quiz__option--correct'
                : index === chosen
                  ? 'quiz__option--wrong'
                  : '';
          return (
            <button
              key={option}
              type="button"
              className={`button quiz__option ${state}`}
              aria-pressed={chosen === index}
              onClick={() => setChosen(index)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <p className="quiz__result" role="status">
          <b>{isCorrect ? t.quiz.correct : t.quiz.wrong}</b> {quiz.why}
        </p>
      )}
    </section>
  );
}
