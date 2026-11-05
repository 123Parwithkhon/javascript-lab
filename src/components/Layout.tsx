import { NavLink, Outlet } from 'react-router';
import { t } from '../i18n';

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            {t.brand}
          </NavLink>
          <nav className="site-nav" aria-label="Основная навигация">
            <NavLink to="/learn">{t.nav.learn}</NavLink>
            <NavLink to="/playground">{t.nav.playground}</NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
