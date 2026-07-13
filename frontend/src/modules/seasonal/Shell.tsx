import { ModuleShell } from '../ModuleShell';

export function SeasonalShell() {
  return (
    <ModuleShell
      icon="📅"
      title="Calendars & Seasonal Timing"
      description="Month/week/day views with zone-based seasonal guidance."
      plannedFeatures={[
        'Month / week / day calendar views',
        'Seasonal overlays & "what\'s blooming"',
        'Zone-based seasonal rules & frost dates',
        'iCal export & Google Calendar sync (stub)',
      ]}
    />
  );
}
