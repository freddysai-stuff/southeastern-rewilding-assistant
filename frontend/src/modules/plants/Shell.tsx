import { ModuleShell } from '../ModuleShell';

export function PlantsShell() {
  return (
    <ModuleShell
      icon="🌿"
      title="Plant Library & Placement"
      description="Browse native plants and plan placement across your plot."
      plannedFeatures={[
        'Card grid with bloom-window & water-needs filters',
        'Plant detail modal',
        'Placement canvas with snapping & spacing rules',
        'Companion planting hints & bloom calendar overlay',
      ]}
    />
  );
}
