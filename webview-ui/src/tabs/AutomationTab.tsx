import { memo, useMemo } from 'react';
import { type AutomationAnalysis, type AutomationCandidateItem } from '../types';

type Props = {
  automation: AutomationAnalysis | null;
  isBusy: boolean;
  feedback: string;
  onAnalyze: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
};

const PRIORITY_META: Record<AutomationCandidateItem['priority'], { cls: string; label: string }> = {
  P1: { cls: 'priority-badge--p1', label: 'P1 — Automate Now' },
  P2: { cls: 'priority-badge--p2', label: 'P2 — Next Release' },
  P3: { cls: 'priority-badge--p3', label: 'P3 — Backlog' },
  P4: { cls: 'priority-badge--p4', label: 'P4 — Manual Only' },
};

function AutoCard({ item }: { item: AutomationCandidateItem }): JSX.Element {
  const { cls, label } = PRIORITY_META[item.priority] ?? PRIORITY_META['P3'];
  return (
    <div className={`auto-card${!item.candidate ? ' auto-card--excluded' : ''}`}>
      <div className="auto-card-header">
        <span className="auto-card-id">{item.testCaseId}</span>
        <span className={`priority-badge ${cls}`}>{label}</span>
      </div>
      <div className="auto-card-metrics">
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">ROI</span>
          <span className="auto-card-metric-value">{item.roiLevel}</span>
        </span>
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">Feasibility</span>
          <span className="auto-card-metric-value">{item.feasibilityLevel}</span>
        </span>
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">Layer</span>
          <span className="auto-card-metric-value">{item.layer}</span>
        </span>
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">Playwright</span>
          <span className="auto-card-metric-value">{item.playwrightAutomatable}</span>
        </span>
      </div>
      {item.playwrightScope !== 'N/A' && (
        <p className="auto-card-notes" style={{ marginBottom: 2 }}>Scope: {item.playwrightScope}</p>
      )}
      {item.blocker && (
        <p className="auto-card-exclusion">Blocker: {item.blocker}</p>
      )}
      {!item.candidate && item.exclusionReason && (
        <p className="auto-card-exclusion">Excluded: {item.exclusionReason}</p>
      )}
      {item.notes && (
        <p className="auto-card-notes">{item.notes}</p>
      )}
    </div>
  );
}

export const AutomationTab = memo(function AutomationTab({ automation, isBusy, feedback, onAnalyze, onExportJson, onExportCsv }: Props): JSX.Element {
  const byLayer = useMemo(() => {
    const groups: Record<'Unit' | 'API' | 'UI', AutomationCandidateItem[]> = { Unit: [], API: [], UI: [] };
    for (const item of automation?.items ?? []) groups[item.layer].push(item);
    return groups;
  }, [automation]);

  return (
    <section className="panel">
      <h2>Automation Candidates</h2>
      <p className="helper-text">Run A–F automation analysis with feasibility, ROI, and layer-based prioritization.</p>
      <div className="button-row">
        <button type="button" onClick={onAnalyze} disabled={isBusy}>Analyze Automation Candidates</button>
        <button type="button" onClick={onExportJson} disabled={!automation}>Export JSON</button>
        <button type="button" onClick={onExportCsv} disabled={!automation}>Export CSV</button>
      </div>

      {!automation ? (
        <div className="empty-state">
          <span className="empty-state-icon">🤖</span>
          <p className="empty-state-title">No Automation Analysis Yet</p>
          <p className="empty-state-action">Click Analyze Automation Candidates above to start.</p>
          <p className="empty-state-tip">Tip: Generate test cases first — analysis requires test case data.</p>
        </div>
      ) : (
        <>
          <p>{automation.summary}</p>
          <p><strong>Recommended Layer Order:</strong> {automation.recommendedOrder.join(' → ')}</p>
          <div className="automation-grid">
            {(['Unit', 'API', 'UI'] as const).map((layer) => (
              <article key={layer} className="enh-card">
                <h3>{layer} <span className="enh-card-count">({byLayer[layer].length})</span></h3>
                {byLayer[layer].length === 0 ? (
                  <p className="helper-text" style={{ margin: 0, fontSize: 12 }}>No candidates in this layer.</p>
                ) : (
                  <div className="auto-card-list">
                    {byLayer[layer].map((item) => (
                      <AutoCard key={item.testCaseId} item={item} />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      <p className="feedback">{feedback}</p>
    </section>
  );
});
