import { Link } from 'react-router';
import { t } from '../i18n';

export function AboutPage() {
  return (
    <article className="container section lesson">
      <h1>{t.about.title}</h1>
      <p className="lead">{t.about.lead}</p>
      {t.about.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      <section>
        <Link to="/learn" className="button button--primary">
          {t.home.start}
        </Link>
      </section>
    </article>
  );
}
