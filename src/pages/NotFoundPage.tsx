import { Link } from 'react-router';
import { t } from '../i18n';

export function NotFoundPage() {
  return (
    <div className="container section">
      <div className="empty-state">
        <h1>{t.notFound.title}</h1>
        <Link to="/" className="button button--primary">
          {t.notFound.home}
        </Link>
      </div>
    </div>
  );
}
