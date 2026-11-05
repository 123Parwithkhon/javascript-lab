import { Link, useParams } from 'react-router';
import { CodeRunner } from '../components/CodeRunner';
import { QuizBlock } from '../components/QuizBlock';
import { findLesson, nextLesson } from '../content/lessons';
import { QUIZZES } from '../content/lessons/quizzes';
import { TASKS } from '../content/tasks';
import { t } from '../i18n';
import { markLessonRead, useProgress } from '../progress/store';
import { NotFoundPage } from './NotFoundPage';

export function LessonPage() {
  const { slug } = useParams();
  const { lessons, solved } = useProgress();
  const lesson = findLesson(slug);

  if (!lesson) return <NotFoundPage />;

  const next = nextLesson(lesson);
  const quiz = QUIZZES[lesson.slug];
  const isRead = Boolean(lessons[lesson.slug]);
  const moduleTasks = TASKS.filter((task) => task.moduleId === lesson.moduleId);
  const practiceTask = moduleTasks.find((task) => !solved[task.id]) ?? moduleTasks[0];
  const markRead = () => markLessonRead(lesson.slug);

  return (
    <article className="container section lesson">
      <Link to="/learn" className="back-link">
        ← {t.learn.backToLessons}
      </Link>
      <h1>{lesson.title}</h1>
      <p className="task__meta">
        {t.home.modules[lesson.moduleId]} · {t.levels[lesson.level]}
        {isRead && <span className="badge badge--solved">✓ {t.learn.read}</span>}
      </p>

      <section>
        <h2>{t.lesson.explanation}</h2>
        {lesson.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <aside className="analogy">
        <h2>{t.lesson.analogy}</h2>
        <p>{lesson.analogy}</p>
      </aside>

      <section>
        <h2>{t.lesson.example}</h2>
        <pre className="code-block" data-testid="lesson-code">
          {lesson.code}
        </pre>
        <h3>{t.lesson.result}</h3>
        <pre className="code-block code-block--output" data-testid="lesson-output">
          {lesson.output.join('\n')}
        </pre>
      </section>

      <section>
        <h2>{t.lesson.lines}</h2>
        <dl className="line-notes">
          {lesson.lines.map((line) => (
            <div key={line.code}>
              <dt>
                <code>{line.code}</code>
              </dt>
              <dd>{line.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>{t.lesson.tryIt}</h2>
        <p>{lesson.tryPrompt}</p>
        <CodeRunner key={lesson.slug} initialCode={lesson.tryCode} setup={lesson.setup} dom={lesson.dom} />
      </section>

      {quiz && <QuizBlock key={lesson.slug} quiz={quiz} />}

      <section>
        <h2>{t.lesson.recap}</h2>
        <ul className="recap">
          {lesson.recap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="lesson__next">
        <h2>{t.lesson.practice}</h2>
        <p>{t.lesson.practiceText(moduleTasks.length)}</p>
        <div className="hero__actions">
          {practiceTask && (
            <Link to={`/trainer/${practiceTask.id}`} className="button button--primary" onClick={markRead}>
              {t.lesson.toPractice}: {practiceTask.title}
            </Link>
          )}
          {next ? (
            <Link to={`/learn/${next.slug}`} className="button" onClick={markRead}>
              {t.lesson.next}: {next.title}
            </Link>
          ) : (
            <Link to="/learn" className="button" onClick={markRead}>
              {t.lesson.finish}
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
