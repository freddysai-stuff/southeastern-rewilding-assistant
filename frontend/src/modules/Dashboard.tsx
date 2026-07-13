import { MODULES } from '../layout/modules';
import { ModuleCard } from '../components/cards/ModuleCard';
import { ContentGrid } from '../layout/ContentGrid';
import './Dashboard.css';

const DESCRIPTIONS: Record<string, string> = {
  soil: 'Core rebuilding, remediation, amendment tracking.',
  specs: 'Project metadata, goals, hosting & planning.',
  plants: 'Filter, browse & place native plants.',
  fertilizer: 'Feeding schedules, dosages, timing.',
  harvesting: 'Harvest logs, propagation, yields.',
  seasonal: 'Seasonal timing, zone-aware planting calendar.',
  ai: 'Ask me anything about your project.',
  pdf: 'Printable summaries & PDF export.',
};

export function Dashboard() {
  return (
    <div className="dashboard">
      <ContentGrid>
        {MODULES.map((m) => (
          <ModuleCard
            key={m.id}
            to={`/${m.id}`}
            icon={m.icon}
            title={m.label}
            description={DESCRIPTIONS[m.id]}
          />
        ))}
      </ContentGrid>
    </div>
  );
}
