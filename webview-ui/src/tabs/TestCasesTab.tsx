import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { type TestCaseItem, type XrayPushPreview, type XrayPushProgress, type XrayPushedIssue } from '../types';
import { CopyButton } from '../components/CopyButton';
import { downloadFile, escapeCsvCell } from '../utils';

type Props = {
  testCases: TestCaseItem[];
  xrayPushPreview: XrayPushPreview | null;
  xrayPushProgress: XrayPushProgress | null;
  xrayPushedIssues: XrayPushedIssue[];
  isBusy: boolean;
  feedback: string;
  onGenerateTestCases: () => void;
  onPreviewPush: () => void;
  onPushToXray: () => void;
  onRetryFailed: () => void;
  onClearHistory: () => void;
};

type Layer = 'Unit' | 'API' | 'UI';
const ALL_LAYERS: Layer[] = ['Unit', 'API', 'UI'];

export const TestCasesTab = memo(function TestCasesTab({
  testCases, xrayPushPreview, xrayPushProgress, xrayPushedIssues,
  isBusy, feedback,
  onGenerateTestCases,
  onPreviewPush, onPushToXray, onRetryFailed, onClearHistory,
}: Props): JSX.Element {
  const hasFailures = xrayPushedIssues.some((i) => !i.success);

  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(new Set(ALL_LAYERS));

  // Reset filter when new test cases are generated
  useEffect(() => {
    setActiveLayers(new Set(ALL_LAYERS));
  }, [testCases]);

  const toggleLayer = useCallback((layer: Layer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        // Keep at least one layer active
        if (next.size > 1) next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  const filteredTestCases = useMemo(
    () => testCases.filter((tc) => activeLayers.has(tc.layer)),
    [testCases, activeLayers]
  );

  const exportGherkin = useCallback((): void => {
    downloadFile(
      'tracelm-test-cases.feature',
      filteredTestCases.map((tc) => tc.gherkin).join('\n\n'),
      'text/plain;charset=utf-8'
    );
  }, [filteredTestCases]);

  const exportCsv = useCallback((): void => {
    const header = ['ID', 'Title', 'ScenarioID', 'RequirementRefs', 'Layer', 'Priority', 'Preconditions', 'Detailed Steps', 'ExpectedResult', 'Test Data'];
    const lines = filteredTestCases.map((tc) => [
      tc.id, tc.title, tc.scenarioId, tc.requirementRefs.join(' | '),
      tc.layer, tc.priority, tc.preconditions.join(' | '),
      tc.steps.join(' | '), tc.expectedResult, tc.testData,
    ]);
    const csv = [header, ...lines].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    downloadFile('tracelm-test-cases.csv', csv, 'text/csv;charset=utf-8');
  }, [filteredTestCases]);

  return (
    <section className="panel">
      <h2>Test Cases</h2>
      <p className="helper-text">Generate test cases from scenarios with Gherkin and structured table output.</p>

      <div className="button-row">
        <button type="button" onClick={onGenerateTestCases} disabled={isBusy}>Generate Test Cases</button>
        <button type="button" onClick={exportGherkin} disabled={!filteredTestCases.length}>Export .feature</button>
        <button type="button" onClick={exportCsv} disabled={!filteredTestCases.length}>Export CSV</button>
        <button type="button" onClick={onPreviewPush} disabled={isBusy || !testCases.length}>Preview Push</button>
        <button type="button" onClick={onPushToXray} disabled={isBusy || !testCases.length}>Push to Xray</button>
        <button type="button" onClick={onRetryFailed} disabled={isBusy || !hasFailures}>Retry Failed Push</button>
        <button type="button" onClick={onClearHistory} disabled={isBusy || !xrayPushedIssues.length}>Clear Push History</button>
      </div>

      {!testCases.length ? (
        <div className="empty-state">
          <span className="empty-state-icon">🧪</span>
          <p className="empty-state-title">No Test Cases Yet</p>
          <p className="empty-state-action">Click Generate Test Cases above to start.</p>
          <p className="empty-state-tip">Tip: Generate Test Scenarios first — test cases are built from scenarios.</p>
        </div>
      ) : (
        <>
          <div className="layer-filter">
            <span className="layer-filter-label">Layer:</span>
            {ALL_LAYERS.map((layer) => (
              <button
                key={layer}
                type="button"
                className={`layer-chip layer-chip--${layer}${activeLayers.has(layer) ? ' layer-chip--active' : ''}`}
                onClick={() => toggleLayer(layer)}
                aria-pressed={activeLayers.has(layer)}
              >
                {layer}
              </button>
            ))}
            {filteredTestCases.length !== testCases.length && (
              <span className="layer-filter-count">
                {filteredTestCases.length} of {testCases.length} shown
              </span>
            )}
          </div>

          <div className="testcase-grid">
            <article className="enh-card">
              <h3>Gherkin View</h3>
              {filteredTestCases.map((tc) => (
                <div key={tc.id} className="gherkin-wrap">
                  <pre className="gherkin-block">{tc.gherkin}</pre>
                  <CopyButton text={tc.gherkin} title="Copy Gherkin" />
                </div>
              ))}
            </article>
            <article className="enh-card">
              <h3>Structured Cases</h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Title</th><th>Scenario</th><th>Requirement Refs</th>
                      <th>Layer</th><th>Priority</th><th>Expected Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTestCases.map((tc) => (
                      <tr key={tc.id}>
                        <td>{tc.id}</td>
                        <td>{tc.title}</td>
                        <td>{tc.scenarioId}</td>
                        <td>{tc.requirementRefs.join(', ')}</td>
                        <td>{tc.layer}</td>
                        <td>{tc.priority}</td>
                        <td>{tc.expectedResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      )}

      {!!xrayPushPreview && (
        <article className="enh-card">
          <h3>Xray Push Preview</h3>
          <p>
            <strong>Summary:</strong>{' '}
            {xrayPushPreview.willPush} to push &nbsp;·&nbsp;
            {xrayPushPreview.duplicates} duplicates &nbsp;·&nbsp;
            {xrayPushPreview.validationErrors} validation errors
            &nbsp;(of {xrayPushPreview.totalCases} total)
          </p>
          <ul className="preview-list">
            {xrayPushPreview.details.map((detail) => {
              const statusMap = {
                valid: { cls: 'preview-item--valid', badge: '✓ Ready' },
                duplicate: { cls: 'preview-item--duplicate', badge: '⊘ Duplicate' },
                'validation-error': { cls: 'preview-item--error', badge: '✗ Error' },
              } as const;
              const { cls, badge } = statusMap[detail.status] ?? statusMap['validation-error'];
              return (
                <li key={detail.id} className={`preview-item ${cls}`}>
                  <span className="preview-item-badge">{badge}</span>
                  <div className="preview-item-body">
                    <span className="preview-item-id">{detail.id}</span>
                    <div className="preview-item-title">{detail.title}</div>
                    {detail.message && <div className="preview-item-hint">{detail.message}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      )}

      {!!xrayPushProgress && (
        <article className="enh-card">
          <h3>Push Progress</h3>
          <p>Batch {xrayPushProgress.batchIndex} of {xrayPushProgress.totalBatches} – {xrayPushProgress.status}</p>
          <p>{xrayPushProgress.message}</p>
        </article>
      )}

      {!!xrayPushedIssues.length && (
        <article className="enh-card">
          <h3>Pushed Xray Issues</h3>
          <ul className="list">
            {xrayPushedIssues.map((issue) => (
              <li key={issue.localId}>
                <strong>{issue.localId}</strong> –{' '}
                {issue.isValidationError ? '[Validation Error]' : issue.success ? 'Success' : 'Failed'}
                {issue.success && issue.key && issue.url && (
                  <> <a href={issue.url}>{issue.key}</a></>
                )}
                {issue.message ? <> ({issue.message})</> : null}
              </li>
            ))}
          </ul>
        </article>
      )}

      <p className="feedback">{feedback}</p>
    </section>
  );
});
