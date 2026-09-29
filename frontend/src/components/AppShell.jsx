import { NavLink } from "react-router-dom";

export function AppShell({ children }) {
  return (
    <>
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="العودة إلى مبصر">
          <span className="brand-mark" aria-hidden="true">
            <i className="fas fa-hands" />
          </span>
          <span>
            <strong>مبصر</strong>
            <small>MUBSIR</small>
          </span>
        </NavLink>
        <nav aria-label="التنقل الرئيسي">
          <NavLink to="/" end>الرئيسية</NavLink>
          <NavLink to="/pilgrim">مسار السائل</NavLink>
          <NavLink to="/mufti">مسار المفتي</NavLink>
        </nav>
      </header>
      <main className="content">{children}</main>
      <footer className="site-footer">مبصر — تواصل بصري يخدم ضيوف الرحمن</footer>
    </>
  );
}
