import { ModuleShell } from '../ModuleShell';
import { Panel } from '../../components/panels/Panel';
import './ai.css';

export function AiShell() {
  return (
    <ModuleShell
      icon="💬"
      title="AI Chat Assistant"
      description="Project-scoped assistant with action suggestions (coming in a later phase)."
      plannedFeatures={[
        'Project-scoped conversation with context injection',
        'Suggested quick actions & deep links to tasks',
        'Source citations for recommendations',
        'Fallback to human review for high-risk advice',
      ]}
    >
      <Panel title="Preview">
        <div className="ai-shell__preview">
          <p className="ai-shell__hint">Ask me anything!</p>
          <div className="ai-shell__suggestion">What should I do today?</div>
          <div className="ai-shell__suggestion">Is it time to trim back my bee balm?</div>
          <div className="ai-shell__suggestion">What should I feed my clover lawn?</div>
        </div>
      </Panel>
    </ModuleShell>
  );
}
