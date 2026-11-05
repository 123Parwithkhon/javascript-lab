import { Link } from 'react-router';
import { LESSONS } from '../content/lessons';
import { TASKS } from '../content/tasks';
import { t } from '../i18n';
import { useProgress } from '../progress/store';

export function LearnPage() {
  const { lessons, solved } = useProgress();
  const readCount = LESSONS.filter((lesson) => lessons[lesson.slug]).length;
  const recommended = LESSONS.find((lesson) => !lessons[lesson.slug]);

  return (
    <div className="container section">
      <h1>{t.learn.title}</h1>
      <p className="lead">{t.learn.lead}</p>

      <div className="progress-panel">
        <p>{t.learn.progress(readCount, LESSONS.length)}</p>
        <progress value={readCount} max={LESSONS.length} aria-label={t.learn.progressLabel} />
        {recommended ? (
          <Link to={`/learn/${recommended.slug}`} className="button button--primary">
            {readCount === 0 ? t.learn.start : t.learn.continue}: {recommended.title}
          </Link>
        ) : (
          <p>{t.learn.finished}</p>
        )}
      </div>

      <ol className="lesson-list">
        {LESSONS.map((lesson) => {
          const moduleTasks = TASKS.filter((task) => task.moduleId === lesson.moduleId);
          const solvedCount = moduleTasks.filter((task) => solved[task.id]).length;
          const isRead = Boolean(lessons[lesson.slug]);
          return (
            <li key={lesson.slug}>
              <Link to={`/learn/${lesson.slug}`} className="lesson-card">
                <span className="lesson-card__number" aria-hidden="true">
                  {lesson.moduleId}
                </span>
                <span className="lesson-card__body">
                  <span className="task-card__title">{lesson.title}</span>
                  <span className="task-card__meta">{lesson.summary}</span>
                  <span className="task-card__meta">
                    {t.levels[lesson.level]} · {t.learn.tasksSolved(solvedCount, moduleTasks.length)}
                  </span>
                  <span className={`badge ${isRead ? 'badge--solved' : ''}`}>
                    {isRead ? `✓ ${t.learn.read}` : t.learn.notRead}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
