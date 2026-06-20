import { memo, useCallback, useEffect, useState } from 'react';
import { type RequirementEnhancement } from '../types';
import { CopyButton } from '../components/CopyButton';

type Props = {
  enhancement: RequirementEnhancement;
  isBusy: boolean;
  feedback: string;
  onGenerate: () => void;
};

type CardKey = keyof RequirementEnhancement;

const CARDS: { key: CardKey; label: string }[] = [
  { key: 'missingFunctional',    label: 'Missing Functional' },
  { key: 'missingNonFunctional', label: 'Missing Non-Functional' },
  { key: 'bestPractices',        label: 'Best Practices' },
  { key: 'marketBenchmark',      label: 'Market Benchmark' },
  { key: 'risks',                label: 'Risks' },
  { key: 'clarifyingQuestions',  label: 'Clarifying Questions' },
];

export const EnhancementTab = memo(function EnhancementTab({ enhancement, isBusy, feedback, onGenerate }: Props): JSX.Element {
  const [collapsed, setCollapsed] = useState<Partial<Record<CardKey, boolean>>>({});

  // Expand all cards when a new generation comes in
  useEffect(() => {
    setCollapsed({});
  }, [enhancement]);

  const toggle = useCallback((key: CardKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <section className="panel">
      <h2>Requirement Enhancement</h2>
      <p className="helper-text">Analyze requirements for missing requirements, non-functional gaps, and market-aligned best practices.</p>
      <div className="button-row">
        <button type="button" onClick={onGenerate} disabled={isBusy}>Generate Enhancement</button>
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
                    <ul className="list" style={{ paddingLeft: 0, listStyle: 'none' }}>
                      {items.map((item) => (
                        <li key={item} className="enh-list-item">
                          <span className="enh-list-item-text">{item}</span>
                          <CopyButton text={item} title="Copy item" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <p className="feedback">{feedback}</p>
    </section>
  );
});
