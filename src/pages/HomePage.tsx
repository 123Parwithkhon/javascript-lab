import { Link } from 'react-router';
import { CodeRunner } from '../components/CodeRunner';
import { LESSON_SLUGS } from '../content/lessons/slugs';
import { t } from '../i18n';

const FIRST_EXAMPLE = t.playground.examples[0].code;

export function HomePage() {
  return (
    <>
      <section className="container hero">
        <div className="hero__text">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.title}</h1>
          <p className="lead">{t.home.lead}</p>
          <div className="hero__actions">
            <Link to="/learn" className="button button--primary">
              {t.home.start}
            </Link>
            <Link to="/playground" className="button">
              {t.home.tryFree}
            </Link>
          </div>
        </div>
        <div className="hero__work">
          <CodeRunner initialCode={FIRST_EXAMPLE} />
          <p className="try-it">💡 {t.home.tryIt}</p>
        </div>
      </section>

      <section className="container section">
        <h2>{t.home.programTitle}</h2>
        <p className="lead">{t.home.programLead}</p>
        <ol className="module-list">
          {t.home.modules.map((module, index) => {
            const slug = LESSON_SLUGS[index];
            const content = (
              <>
                <span className="module-list__number">{index}</span>
                {module}
              </>
            );
            return (
              <li key={module}>
                {slug ? (
                  <Link to={`/learn/${slug}`} className="module-list__item module-list__item--link">
                    {content}
                  </Link>
                ) : (
                  <span className="module-list__item module-list__item--soon">
                    {content}
                    <span className="module-list__soon">{t.home.soon}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="container section">
        <h2>{t.home.projectsTitle}</h2>
        <ul className="project-list">
          {t.home.projects.map((project) => (
            <li key={project}>{project}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
