import { Link } from 'react-router';
import { CodeRunner } from '../components/CodeRunner';
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
        <CodeRunner initialCode={FIRST_EXAMPLE} />
      </section>

      <section className="container section">
        <h2>{t.home.programTitle}</h2>
        <p className="lead">{t.home.programLead}</p>
        <ol className="module-list">
          {t.home.modules.map((module, index) => (
            <li key={module} className="module-list__item">
              <span className="module-list__number">{index}</span>
              {module}
            </li>
          ))}
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
