import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Работа без интернета только в собранной версии: в разработке кэш мешал бы видеть правки.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Без этого сайт просто будет требовать интернет, как обычный сайт.
    });
  });
}

const root = document.getElementById('root');
if (!root) throw new Error('Не найден элемент #root в index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
