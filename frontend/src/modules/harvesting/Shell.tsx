import { ModuleShell } from '../ModuleShell';

export function HarvestingShell() {
  return (
    <ModuleShell
      icon="🌾"
      title="Harvesting & Propagation"
      description="Track harvests, propagation tasks, and yield history."
      plannedFeatures={[
        'Harvest log',
        'Propagation tasks & recipes per species',
        'Success rate tracking',
        'Yield summaries per season',
      ]}
    />
  );
}
