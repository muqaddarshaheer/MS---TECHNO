import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function DashboardShell({ brand, subtitle, links, onLogout, superTheme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`app-shell ${superTheme ? 'app-shell-super' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
        <div className="topbar-brand">
          <div className="brand topbar-title">{brand}</div>
          {subtitle ? <div className="topbar-sub">{subtitle}</div> : null}
        </div>
      </header>

      {open && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${superTheme ? 'super' : ''} ${open ? 'open' : ''}`}>
        <div className="sidebar-desktop-head">
          <div className="brand">{brand}</div>
          {subtitle ? (
            <div className="sidebar-sub">{subtitle}</div>
          ) : null}
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={`nav-link danger logout-btn ${superTheme ? 'logout-super' : ''}`}
          onClick={onLogout}
        >
          Logout
        </button>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
