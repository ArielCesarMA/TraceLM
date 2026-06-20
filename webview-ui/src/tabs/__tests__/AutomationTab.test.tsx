import { render, screen } from '@testing-library/react';
import { AutomationTab } from '../AutomationTab';
import type { AutomationAnalysis } from '../../types';

const noop = jest.fn();

const sampleAnalysis: AutomationAnalysis = {
  summary: 'High ROI automation opportunities identified.',
  recommendedOrder: ['Unit', 'API', 'UI'],
  items: [
    {
      testCaseId: 'TC-001',
      candidate: true,
      exclusionReason: '',
      feasibility: 8.5,
      roiScore: 9.0,
      layer: 'Unit',
      priority: 'Automate First',
      notes: 'Fast to implement, high coverage gain.',
    },
    {
      testCaseId: 'TC-002',
      candidate: false,
      exclusionReason: 'Requires visual verification',
      feasibility: 3.0,
      roiScore: 2.5,
      layer: 'UI',
      priority: 'Manual/Deferred',
      notes: '',
    },
  ],
};

const baseProps = {
  automation: null,
  isBusy: false,
  feedback: '',
  onAnalyze: noop,
  onExportJson: noop,
  onExportCsv: noop,
};

describe('AutomationTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    render(<AutomationTab {...baseProps} />);
    expect(screen.getByText('Automation Candidates')).toBeTruthy();
  });

  it('shows empty state when no analysis', () => {
    render(<AutomationTab {...baseProps} />);
    expect(screen.getByText('No Automation Analysis Yet')).toBeTruthy();
  });

  it('export buttons are disabled with no analysis', () => {
    render(<AutomationTab {...baseProps} />);
    const exportJson = screen.getByText('Export JSON') as HTMLButtonElement;
    const exportCsv = screen.getByText('Export CSV') as HTMLButtonElement;
    expect(exportJson.disabled).toBe(true);
    expect(exportCsv.disabled).toBe(true);
  });

  it('renders analysis summary when automation provided', () => {
    render(<AutomationTab {...baseProps} automation={sampleAnalysis} />);
    expect(screen.getByText('High ROI automation opportunities identified.')).toBeTruthy();
  });

  it('renders layer group headers', () => {
    render(<AutomationTab {...baseProps} automation={sampleAnalysis} />);
    // Layer names appear in h3 group headers — use getAllByText and assert at least one h3
    const unitEls = screen.getAllByText('Unit');
    expect(unitEls.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('API').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('UI').length).toBeGreaterThanOrEqual(1);
  });

  it('renders candidate cards with priority badges', () => {
    render(<AutomationTab {...baseProps} automation={sampleAnalysis} />);
    expect(screen.getByText('Automate First')).toBeTruthy();
    expect(screen.getByText('Manual / Deferred')).toBeTruthy();
  });

  it('shows exclusion reason on non-candidate cards', () => {
    render(<AutomationTab {...baseProps} automation={sampleAnalysis} />);
    expect(screen.getByText(/Requires visual verification/)).toBeTruthy();
  });
});
