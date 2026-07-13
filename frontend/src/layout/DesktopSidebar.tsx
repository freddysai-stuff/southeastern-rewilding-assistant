import { NavLink } from 'react-router-dom';
import { MODULES } from './modules';
import './DesktopSidebar.css';

export function DesktopSidebar() {
  return (
    <nav className="desktop-sidebar" aria-label="Module navigation">
      {MODULES.map((m) => (
        <NavLink
          key={m.id}
          to={`/${m.id}`}
          className={({ isActive }) => `desktop-sidebar__item${isActive ? ' is-active' : ''}`}
        >
          <span className="desktop-sidebar__icon" aria-hidden="true">
            {m.icon}
          </span>
          <span>{m.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
