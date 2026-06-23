import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type RequirementEnhancement } from '../types';
import { CopyButton } from '../components/CopyButton';
import { downloadFile, escapeCsvCell } from '../utils';

type CardKey = keyof RequirementEnhancement;

type Props = {
  enhancement: RequirementEnhancement;
  isBusy: boolean;
  feedback: string;
  generatedAt?: Date | null;
  onGenerate: () => void;
  onUpdateItem: (key: CardKey, index: number, value: string) => void;
  onDeleteItem: (key: CardKey, index: number) => void;
};

const CARDS: { key: CardKey; label: string }[] = [
  { key: 'risks',                label: 'Risks' },
  { key: 'missingFunctional',    label: 'Missing Functional' },
  { key: 'missingNonFunctional', label: 'Missing Non-Functional' },
  { key: 'bestPractices',        label: 'Best Practices' },
  { key: 'marketBenchmark',      label: 'Market Benchmark' },
  { key: 'clarifyingQuestions',  label: 'Clarifying Questions' },
];

type EditingState = { key: CardKey; index: number; value: string } | null;

export const EnhancementTab = memo(function EnhancementTab({
  enhancement, isBusy, feedback, generatedAt,
  onGenerate, onUpdateItem, onDeleteItem,
}: Props): JSX.Element {
  const [collapsed, setCollapsed] = useState<Partial<Record<CardKey, boolean>>>({});
  const [editing, setEditing] = useState<EditingState>(null);
  const [exportFilter, setExportFilter] = useState<Record<CardKey, boolean>>(
    () => Object.fromEntries(CARDS.map(({ key }) => [key, true])) as Record<CardKey, boolean>
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [filterOpen]);

  const total = useMemo(
    () => Object.values(enhancement).reduce((sum, arr) => sum + arr.length, 0),
    [enhancement]
  );

  const hasFindings = total > 0;

  useEffect(() => {
    setCollapsed({});
    setEditing(null);
  }, [enhancement]);

  const toggle = useCallback((key: CardKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const collapseAll = useCallback(() => {
    const all: Partial<Record<CardKey, boolean>> = {};
    CARDS.forEach(({ key }) => { all[key] = true; });
    setCollapsed(all);
  }, []);

  const expandAll = useCallback(() => setCollapsed({}), []);

  const allCollapsed = CARDS.every(({ key }) => !!collapsed[key]);

  const handleGenerate = useCallback(() => {
    if (hasFindings && !window.confirm('Regenerating will replace all current findings. Continue?')) return;
    onGenerate();
  }, [hasFindings, onGenerate]);

  const copyAll = useCallback((key: CardKey) => {
    const text = enhancement[key].join('\n');
    navigator.clipboard.writeText(text).catch(() => undefined);
  }, [enhancement]);

  const startEdit = useCallback((key: CardKey, index: number) => {
    setEditing({ key, index, value: enhancement[key][index] });
  }, [enhancement]);

  const commitEdit = useCallback(() => {
    if (!editing) return;
    if (editing.value.trim()) {
      onUpdateItem(editing.key, editing.index, editing.value.trim());
    }
    setEditing(null);
  }, [editing, onUpdateItem]);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const toggleExportFilter = useCallback((key: CardKey) => {
    setExportFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredCards = useCallback(
    () => CARDS.filter(({ key }) => exportFilter[key]),
    [exportFilter]
  );

  const exportJson = useCallback(() => {
    const filtered = Object.fromEntries(
      filteredCards().map(({ key }) => [key, enhancement[key]])
    );
    downloadFile(
      'tracelm-requirement-enhancement.json',
      JSON.stringify(filtered, null, 2),
      'application/json;charset=utf-8'
    );
  }, [enhancement, filteredCards]);

  const exportCsv = useCallback(() => {
    const header = ['Category', 'Finding'];
    const lines: string[][] = [];
    filteredCards().forEach(({ key, label }) => {
      enhancement[key].forEach((item) => lines.push([label, item]));
    });
    const csv = [header, ...lines].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    downloadFile('tracelm-requirement-enhancement.csv', csv, 'text/csv;charset=utf-8');
  }, [enhancement, filteredCards]);

  return (
    <section className="panel">
      <h2>Requirement Enhancement</h2>
      <p className="helper-text">Analyze requirements for missing requirements, non-functional gaps, and market-aligned best practices.</p>

      <div className="button-row">
        <button type="button" onClick={handleGenerate} disabled={isBusy}>Generate Enhancement</button>
        <div className="enh-filter-dropdown" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            disabled={!hasFindings}
            className="enh-filter-trigger"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
          >
            Export includes ({CARDS.filter(({ key }) => exportFilter[key]).length}/{CARDS.length}) ▾
          </button>
          {filterOpen && (
            <div className="enh-filter-popover" role="listbox" aria-multiselectable="true">
              <div className="enh-filter-popover-header">
                <button type="button" className="enh-filter-popover-action" onClick={() => setExportFilter(Object.fromEntries(CARDS.map(({ key }) => [key, true])) as Record<CardKey, boolean>)}>All</button>
                <button type="button" className="enh-filter-popover-action" onClick={() => setExportFilter(Object.fromEntries(CARDS.map(({ key }) => [key, false])) as Record<CardKey, boolean>)}>None</button>
              </div>
              {CARDS.map(({ key, label }) => (
                <label key={key} className="enh-filter-popover-item">
                  <input
                    type="checkbox"
                    checked={exportFilter[key]}
                    onChange={() => toggleExportFilter(key)}
                  />
                  <span>{label}</span>
                  <span className="enh-filter-popover-count">{enhancement[key].length}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={exportJson} disabled={!hasFindings}>Export JSON</button>
        <button type="button" onClick={exportCsv} disabled={!hasFindings}>Export CSV</button>
        {hasFindings && (
          <button type="button" onClick={allCollapsed ? expandAll : collapseAll}>
            {allCollapsed ? 'Expand All' : 'Collapse All'}
          </button>
        )}
      </div>


      {!hasFindings ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p className="empty-state-title">No Enhancement Analysis Yet</p>
          <p className="empty-state-action">Click Generate Enhancement above to start.</p>
          <p className="empty-state-tip">Tip: Add your requirements text first — richer input produces more targeted findings.</p>
        </div>
      ) : (
        <>
          <div className="enh-summary">
            <span className="enh-summary-total">{total} findings</span>
            {CARDS.map(({ key, label }) => enhancement[key].length > 0 && (
              <span key={key} className="enh-summary-item">{label}: {enhancement[key].length}</span>
            ))}
            {generatedAt && (
              <span className="enh-summary-timestamp">
                Last generated: {generatedAt.toLocaleString()}
              </span>
            )}
          </div>

          <div className="enhancement-grid">
            {CARDS.map(({ key, label }) => {
              const items = enhancement[key];
              const isCollapsed = !!collapsed[key];
              return (
                <article key={key} className="enh-card">
                  <div
                    className="enh-card-header"
                    onClick={() => toggle(key)}
                    role="button"
                    aria-expanded={!isCollapsed}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(key)}
                  >
                    <h3>
                      {label}
                      {items.length > 0 && (
                        <span className="enh-card-count">({items.length})</span>
                      )}
                    </h3>
                    <button
                      type="button"
                      className="enh-card-toggle"
                      aria-label={isCollapsed ? `Expand ${label}` : `Collapse ${label}`}
                      tabIndex={-1}
                    >
                      {isCollapsed ? '▶' : '▼'}
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="enh-card-body">
                      {items.length === 0 ? (
                        <p className="helper-text" style={{ margin: 0, fontSize: 12 }}>None identified.</p>
                      ) : (
                        <>
                          <div className="enh-card-actions">
                            <button
                              type="button"
                              className="enh-copy-all-btn"
                              title={`Copy all ${label} findings`}
                              onClick={(e) => { e.stopPropagation(); copyAll(key); }}
                            >
                              Copy All
                            </button>
                          </div>
                          <ul className="list" style={{ paddingLeft: 0, listStyle: 'none' }}>
                            {items.map((item, index) => {
                              const isEditing = editing?.key === key && editing.index === index;
                              return (
                                <li key={index} className="enh-list-item">
                                  {isEditing ? (
                                    <textarea
                                      className="enh-item-textarea"
                                      value={editing.value}
                                      autoFocus
                                      onChange={(e) => setEditing({ key, index, value: e.target.value })}
                                      onBlur={commitEdit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                                      }}
                                    />
                                  ) : (
                                    <span
                                      className="enh-list-item-text"
                                      title="Click to edit"
                                      onClick={() => startEdit(key, index)}
                                      style={{ cursor: 'text' }}
                                    >
                                      {item}
                                    </span>
                                  )}
                                  <div className="enh-item-actions">
                                    <CopyButton text={item} title="Copy item" />
                                    <button
                                      type="button"
                                      className="enh-item-delete-btn"
                                      title="Delete finding"
                                      onClick={() => onDeleteItem(key, index)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      <p className="feedback">{feedback}</p>
    </section>
  );
});
