import { NavLink, Outlet } from 'react-router';
import { t } from '../i18n';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <NavLink to="/" className="brand" aria-label={t.brand}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span className="brand__text">{t.brand}</span>
          </NavLink>
          <div className="site-header__end">
            <nav className="site-nav" aria-label="Основная навигация">
              <NavLink to="/learn">{t.nav.learn}</NavLink>
              <NavLink to="/trainer">{t.nav.trainer}</NavLink>
              <NavLink to="/projects">{t.nav.projects}</NavLink>
              <NavLink to="/playground">{t.nav.playground}</NavLink>
              <NavLink to="/profile">{t.nav.profile}</NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <NavLink to="/about">{t.nav.about}</NavLink>
        </div>
      </footer>
    </>
  );
}
