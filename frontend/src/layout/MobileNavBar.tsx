import { NavLink } from 'react-router-dom';
import { MODULES } from './modules';
import './MobileNavBar.css';

// Mobile bottom nav surfaces a curated subset of modules to avoid crowding,
// matching the mockups (Tasks / Checklist / Blooming / Soil Check style bar).
const MOBILE_PRIMARY_IDS = ['soil', 'plants', 'seasonal', 'ai'] as const;

export function MobileNavBar() {
  const items = MODULES.filter((m) => (MOBILE_PRIMARY_IDS as readonly string[]).includes(m.id));

  return (
    <nav className="mobile-nav-bar" aria-label="Primary navigation">
      {items.map((m) => (
        <NavLink
          key={m.id}
          to={`/${m.id}`}
          className={({ isActive }) => `mobile-nav-bar__item${isActive ? ' is-active' : ''}`}
        >
          <span aria-hidden="true">{m.icon}</span>
          <span className="mobile-nav-bar__label">{m.label.split(' ')[0]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
