import { ModuleShell } from '../ModuleShell';

export function SpecsShell() {
  return (
    <ModuleShell
      icon="📋"
      title="Project Specifications"
      description="Project metadata, goals, constraints, and planning docs."
      plannedFeatures={[
        'Project metadata, goals & constraints',
        'Site photos & permit checklist',
        'Project templates and cloning',
        'Links to calendar events and tasks',
      ]}
    />
  );
}
