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
  'Automate First':    { cls: 'priority-badge--first',    label: 'Automate First' },
  'Automate Second':   { cls: 'priority-badge--second',   label: 'Automate Second' },
  'Manual/Deferred':   { cls: 'priority-badge--deferred', label: 'Manual / Deferred' },
};

function AutoCard({ item }: { item: AutomationCandidateItem }): JSX.Element {
  const { cls, label } = PRIORITY_META[item.priority] ?? PRIORITY_META['Manual/Deferred'];
  return (
    <div className={`auto-card${!item.candidate ? ' auto-card--excluded' : ''}`}>
      <div className="auto-card-header">
        <span className="auto-card-id">{item.testCaseId}</span>
        <span className={`priority-badge ${cls}`}>{label}</span>
      </div>
      <div className="auto-card-metrics">
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">ROI</span>
          <span className="auto-card-metric-value">{item.roiScore.toFixed(1)}</span>
        </span>
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">Feasibility</span>
          <span className="auto-card-metric-value">{item.feasibility.toFixed(1)}</span>
        </span>
        <span className="auto-card-metric">
          <span className="auto-card-metric-label">Layer</span>
          <span className="auto-card-metric-value">{item.layer}</span>
        </span>
      </div>
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
