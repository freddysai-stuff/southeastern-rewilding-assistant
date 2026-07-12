import { ModuleShell } from '../ModuleShell';

export function SoilShell() {
  return (
    <ModuleShell
      icon="🌱"
      title="Lawn & Soil Rebuilding"
      description="Core rebuilding, remediation, and soil health tracking."
      plannedFeatures={[
        'Soil test wizard (pH, organic matter, compaction)',
        'Remediation & amendment recommendations',
        'Amendment calculator',
        'Historical soil profile versioning',
      ]}
    />
  );
}
