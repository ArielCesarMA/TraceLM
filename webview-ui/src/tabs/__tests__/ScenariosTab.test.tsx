import { render, screen, fireEvent } from '@testing-library/react';
import { ScenariosTab } from '../ScenariosTab';
import type { ScenarioItem } from '../../types';

const noop = jest.fn();

const sampleScenario: ScenarioItem = {
  id: 'SCN-001',
  title: 'Login with valid credentials',
  requirementRefs: ['REQ-1'],
  preconditions: ['User exists'],
  flow: ['Navigate to login', 'Enter credentials', 'Submit'],
  expectedOutcome: 'User is redirected to dashboard',
  priority: 'High',
};

const baseProps = {
  scenarios: [],
  isBusy: false,
  feedback: '',
  onGenerate: noop,
  onUpdateField: noop,
  onAddScenario: noop,
  onDeleteScenario: noop,
};

describe('ScenariosTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    render(<ScenariosTab {...baseProps} />);
    expect(screen.getByText('Test Scenarios')).toBeTruthy();
  });

  it('shows empty state when no scenarios', () => {
    render(<ScenariosTab {...baseProps} />);
    expect(screen.getByText('No Test Scenarios Yet')).toBeTruthy();
  });

  it('renders scenario cards when scenarios provided', () => {
    render(<ScenariosTab {...baseProps} scenarios={[sampleScenario]} />);
    expect(screen.getByDisplayValue('Login with valid credentials')).toBeTruthy();
  });

  it('export buttons are disabled with no scenarios', () => {
    render(<ScenariosTab {...baseProps} />);
    const exportJson = screen.getByText('Export JSON') as HTMLButtonElement;
    const exportCsv = screen.getByText('Export CSV') as HTMLButtonElement;
    expect(exportJson.disabled).toBe(true);
    expect(exportCsv.disabled).toBe(true);
  });

  it('export buttons are enabled when scenarios exist', () => {
    render(<ScenariosTab {...baseProps} scenarios={[sampleScenario]} />);
    const exportJson = screen.getByText('Export JSON') as HTMLButtonElement;
    expect(exportJson.disabled).toBe(false);
  });

  it('calls onAddScenario when Add Scenario clicked', () => {
    render(<ScenariosTab {...baseProps} />);
    fireEvent.click(screen.getByText('Add Scenario'));
    expect(noop).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteScenario with correct index when delete clicked', () => {
    const onDelete = jest.fn();
    render(<ScenariosTab {...baseProps} scenarios={[sampleScenario]} onDeleteScenario={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete this scenario'));
    expect(onDelete).toHaveBeenCalledWith(0);
  });
});
