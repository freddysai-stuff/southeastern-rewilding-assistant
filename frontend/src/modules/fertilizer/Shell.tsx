import { ModuleShell } from '../ModuleShell';

export function FertilizerShell() {
  return (
    <ModuleShell
      icon="🧪"
      title="Fertilizer & Feeding System"
      description="Build feeding schedules and calculate dosages per plot."
      plannedFeatures={[
        'Schedule builder & product selector',
        'Dosage calculator',
        'Feeding rules per plant type & soil profile',
        'Local reminders & calendar events',
      ]}
    />
  );
}
