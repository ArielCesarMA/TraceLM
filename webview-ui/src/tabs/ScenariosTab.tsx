import { memo } from 'react';
import { type ScenarioItem } from '../types';
import { downloadFile, escapeCsvCell } from '../utils';

type Props = {
  scenarios: ScenarioItem[];
  isBusy: boolean;
  feedback: string;
  onGenerate: () => void;
  onUpdateField: (index: number, key: keyof ScenarioItem, value: string) => void;
  onAddScenario: () => void;
  onDeleteScenario: (index: number) => void;
};

export const ScenariosTab = memo(function ScenariosTab({
  scenarios, isBusy, feedback,
  onGenerate, onUpdateField, onAddScenario, onDeleteScenario,
}: Props): JSX.Element {
  const hasScenarios = scenarios.length > 0;

  function exportJson(): void {
    downloadFile('tracelm-scenarios.json', JSON.stringify(scenarios, null, 2), 'application/json;charset=utf-8');
  }

  function exportCsv(): void {
    const header = ['ID', 'Title', 'Priority', 'RequirementRefs', 'Preconditions', 'Flow', 'ExpectedOutcome'];
    const lines = scenarios.map((s) => [
      s.id, s.title, s.priority,
      s.requirementRefs.join(' | '), s.preconditions.join(' | '),
      s.flow.join(' | '), s.expectedOutcome,
    ]);
    const csv = [header, ...lines].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    downloadFile('tracelm-scenarios.csv', csv, 'text/csv;charset=utf-8');
  }

  return (
    <section className="panel">
      <h2>Test Scenarios</h2>
      <p className="helper-text">Generate and refine scenarios from requirements and enhancement output.</p>
      <div className="button-row">
        <button type="button" onClick={onGenerate} disabled={isBusy}>Generate Scenarios</button>
        <button type="button" onClick={onAddScenario} disabled={isBusy}>Add Scenario</button>
        <button type="button" onClick={exportJson} disabled={!hasScenarios}>Export JSON</button>
        <button type="button" onClick={exportCsv} disabled={!hasScenarios}>Export CSV</button>
      </div>

      {!hasScenarios ? (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <p className="empty-state-title">No Test Scenarios Yet</p>
          <p className="empty-state-action">Click Generate Scenarios above to start.</p>
          <p className="empty-state-tip">Tip: Running Requirement Enhancement first improves scenario quality.</p>
        </div>
      ) : (
        <div className="scenario-list">
          {scenarios.map((scenario, index) => (
            <article key={scenario.id} className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-card-index">#{index + 1}</span>
                <button
                  type="button"
                  className="scenario-delete-btn"
                  title="Delete this scenario"
                  onClick={() => onDeleteScenario(index)}
                >
                  ✕
                </button>
              </div>
              <div className="field-row">
                <label htmlFor={`id-${index}`}>ID</label>
                <input id={`id-${index}`} type="text" value={scenario.id} onChange={(e) => onUpdateField(index, 'id', e.target.value)} />
              </div>
              <div className="field-row">
                <label htmlFor={`title-${index}`}>Title</label>
                <input id={`title-${index}`} type="text" value={scenario.title} onChange={(e) => onUpdateField(index, 'title', e.target.value)} />
              </div>
              <div className="field-row">
                <label htmlFor={`priority-${index}`}>Priority</label>
                <input id={`priority-${index}`} type="text" value={scenario.priority} onChange={(e) => onUpdateField(index, 'priority', e.target.value)} />
              </div>
              <div className="field-stack">
                <label htmlFor={`refs-${index}`}>Requirement Refs (one per line)</label>
                <textarea id={`refs-${index}`} className="small-text" value={scenario.requirementRefs.join('\n')} onChange={(e) => onUpdateField(index, 'requirementRefs', e.target.value)} />
              </div>
              <div className="field-stack">
                <label htmlFor={`pre-${index}`}>Preconditions (one per line)</label>
                <textarea id={`pre-${index}`} className="small-text" value={scenario.preconditions.join('\n')} onChange={(e) => onUpdateField(index, 'preconditions', e.target.value)} />
              </div>
              <div className="field-stack">
                <label htmlFor={`flow-${index}`}>Flow (one per line)</label>
                <textarea id={`flow-${index}`} className="small-text" value={scenario.flow.join('\n')} onChange={(e) => onUpdateField(index, 'flow', e.target.value)} />
              </div>
              <div className="field-stack">
                <label htmlFor={`outcome-${index}`}>Expected Outcome</label>
                <textarea id={`outcome-${index}`} className="small-text" value={scenario.expectedOutcome} onChange={(e) => onUpdateField(index, 'expectedOutcome', e.target.value)} />
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="feedback">{feedback}</p>
    </section>
  );
});
