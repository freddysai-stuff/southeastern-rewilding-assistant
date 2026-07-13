import type { ReactNode } from 'react';
import { Panel } from '../components/panels/Panel';
import './ModuleShell.css';

interface ModuleShellProps {
  icon: string;
  title: string;
  description: string;
  plannedFeatures: string[];
  children?: ReactNode;
}

/**
 * Shared visual shell for each of the 8 top-level modules. Renders the
 * module header + a "planned features" panel listing what this module will
 * do once its logic layer is implemented. Pass `children` to add
 * module-specific placeholder content below.
 */
export function ModuleShell({ icon, title, description, plannedFeatures, children }: ModuleShellProps) {
  return (
    <div className="module-shell">
      <div className="module-shell__header">
        <span className="module-shell__icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          <p className="module-shell__description">{description}</p>
        </div>
      </div>
      <Panel title="Planned in this module">
        <ul className="module-shell__feature-list">
          {plannedFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </Panel>
      {children}
    </div>
  );
}
