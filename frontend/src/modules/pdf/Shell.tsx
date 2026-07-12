import { ModuleShell } from '../ModuleShell';
import { Button } from '../../components/buttons/Button';

export function PdfShell() {
  return (
    <ModuleShell
      icon="🖨️"
      title="Printable & PDF Generator"
      description="Export project summaries, planting plans, and checklists."
      plannedFeatures={[
        'Project summary & planting plan export',
        'Seasonal checklists & soil reports',
        'Server-side rendering for consistent layout',
        'Client-side quick preview',
      ]}
    >
      <Button variant="primary" disabled>
        Generate PDF (coming soon)
      </Button>
    </ModuleShell>
  );
}
