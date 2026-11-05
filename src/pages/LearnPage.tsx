import { Link } from 'react-router';
import { t } from '../i18n';

export function LearnPage() {
  return (
    <div className="container section">
      <h1>{t.learn.title}</h1>
      <div className="empty-state">
        <h2>{t.learn.emptyTitle}</h2>
        <p>{t.learn.emptyText}</p>
        <Link to="/playground" className="button button--primary">
          {t.learn.toPlayground}
        </Link>
      </div>
    </div>
  );
}
