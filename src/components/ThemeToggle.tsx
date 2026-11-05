import { useState } from 'react';
import { t } from '../i18n';

const STORAGE_KEY = 'jslab.theme';

type Theme = 'light' | 'dark';

/** Тема до выбора пользователя следует настройке системы. */
function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Хранилище недоступно: тема действует до закрытия вкладки.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={next === 'dark' ? t.theme.toDark : t.theme.toLight}
      title={next === 'dark' ? t.theme.toDark : t.theme.toLight}
      onClick={toggle}
    >
      <span aria-hidden="true">{next === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}
