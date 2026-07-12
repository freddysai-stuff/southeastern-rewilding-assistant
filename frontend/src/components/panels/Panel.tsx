import { useState } from 'react';
import type { ReactNode } from 'react';
import './Panel.css';

interface PanelProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Used for module content sections (soil recommendations, fertilizer
// schedules, seasonal notes, etc). Supports an optional collapsible mode.
export function Panel({ title, children, collapsible = false, defaultCollapsed = false }: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="sera-panel">
      <header className="sera-panel__header">
        <h3 className="sera-panel__title">{title}</h3>
        {collapsible && (
          <button
            type="button"
            className="sera-panel__toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
          >
            {collapsed ? '+' : '–'}
          </button>
        )}
      </header>
      {!collapsed && <div className="sera-panel__body">{children}</div>}
    </section>
  );
}
