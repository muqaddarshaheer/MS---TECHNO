import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function DashboardShell({
  brand,
  subtitle,
  links,
  onLogout,
  superTheme,
  accountLocked = false,
  lockTitle = 'Your account is blocked',
  lockMessage = 'Kindly contact your software provider.',
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open || accountLocked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, accountLocked]);

  return (
    <div className={`app-shell ${superTheme ? 'app-shell-super' : ''} ${accountLocked ? 'account-locked' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => !accountLocked && setOpen((v) => !v)}
          disabled={accountLocked}
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

      {open && !accountLocked && (
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
          {subtitle ? <div className="sidebar-sub">{subtitle}</div> : null}
        </div>

        <nav className="sidebar-nav" aria-disabled={accountLocked}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                if (accountLocked) {
                  e.preventDefault();
                  return;
                }
                setOpen(false);
              }}
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
        <div className={accountLocked ? 'main-blurred' : undefined}>
          <Outlet />
        </div>
      </main>

      {accountLocked && (
        <div className="account-lock-overlay" role="alertdialog" aria-modal="true" aria-labelledby="lock-title">
          <div className="account-lock-card">
            <div className="account-lock-icon" aria-hidden="true">
              ⛔
            </div>
            <h2 id="lock-title">{lockTitle}</h2>
            <p>{lockMessage}</p>
            <p className="account-lock-hint">Access to POS, stock, and reports is disabled until your account is unblocked.</p>
            <button type="button" className="btn btn-primary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
