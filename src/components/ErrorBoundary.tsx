import { Component, type ReactNode } from 'react';
import { t } from '../i18n';

interface ErrorBoundaryState {
  failed: boolean;
}

/** Если страница не загрузилась, например из-за обрыва сети, показываем выход вместо пустого экрана. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container section">
        <div className="empty-state">
          <h1>{t.pageFailed.title}</h1>
          <p>{t.pageFailed.text}</p>
          <button type="button" className="button button--primary" onClick={() => window.location.reload()}>
            {t.pageFailed.retry}
          </button>
        </div>
      </div>
    );
  }
}
