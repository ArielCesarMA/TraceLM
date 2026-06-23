import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancementTab } from '../EnhancementTab';
import { emptyEnhancement } from '../../types';

const noop = jest.fn();

const baseProps = {
  enhancement: emptyEnhancement,
  isBusy: false,
  feedback: '',
  onGenerate: noop,
  onUpdateItem: noop,
  onDeleteItem: noop,
};

const withFindings = {
  ...emptyEnhancement,
  risks: ['Risk A', 'Risk B'],
  missingFunctional: ['Gap 1'],
};

describe('EnhancementTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText('Requirement Enhancement')).toBeTruthy();
  });

  it('renders Generate Enhancement button', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText('Generate Enhancement')).toBeTruthy();
  });

  it('shows empty state when no findings', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText('No Enhancement Analysis Yet')).toBeTruthy();
  });

  it('does not show empty state when findings exist', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.queryByText('No Enhancement Analysis Yet')).toBeNull();
  });

  it('export buttons are disabled when no findings', () => {
    render(<EnhancementTab {...baseProps} />);
    const exportJson = screen.getByText('Export JSON') as HTMLButtonElement;
    const exportCsv = screen.getByText('Export CSV') as HTMLButtonElement;
    expect(exportJson.disabled).toBe(true);
    expect(exportCsv.disabled).toBe(true);
  });

  it('export buttons are enabled when findings exist', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    const exportJson = screen.getByText('Export JSON') as HTMLButtonElement;
    const exportCsv = screen.getByText('Export CSV') as HTMLButtonElement;
    expect(exportJson.disabled).toBe(false);
    expect(exportCsv.disabled).toBe(false);
  });

  it('renders all six card headers when findings exist', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.getAllByText(/Missing Functional/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Missing Non-Functional/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Best Practices/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Market Benchmark/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Risks/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Clarifying Questions/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows item count badge when card has items', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.getByText('(2)')).toBeTruthy(); // Risks: 2
    expect(screen.getByText('(1)')).toBeTruthy(); // missingFunctional: 1
  });

  it('shows summary banner with total findings count', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.getByText('3 findings')).toBeTruthy();
  });

  it('renders risk items as finding text', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.getByText('Risk A')).toBeTruthy();
    expect(screen.getByText('Risk B')).toBeTruthy();
  });

  it('calls onDeleteItem when delete button clicked', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    const deleteButtons = screen.getAllByTitle('Delete finding');
    fireEvent.click(deleteButtons[0]);
    expect(noop).toHaveBeenCalledWith('risks', 0);
  });

  it('shows Collapse All button when findings exist', () => {
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    expect(screen.getByText('Collapse All')).toBeTruthy();
  });

  it('renders feedback text', () => {
    render(<EnhancementTab {...baseProps} feedback="Requirement enhancement complete." />);
    expect(screen.getByText('Requirement enhancement complete.')).toBeTruthy();
  });

  it('prompts confirmation before regenerating when findings exist', () => {
    window.confirm = jest.fn(() => false);
    render(<EnhancementTab {...baseProps} enhancement={withFindings} />);
    fireEvent.click(screen.getByText('Generate Enhancement'));
    expect(window.confirm).toHaveBeenCalled();
    expect(noop).not.toHaveBeenCalledWith(); // onGenerate not called because cancelled
  });
});
