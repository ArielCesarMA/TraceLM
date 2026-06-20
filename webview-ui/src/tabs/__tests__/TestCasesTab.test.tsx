import { render, screen } from '@testing-library/react';
import { TestCasesTab } from '../TestCasesTab';
import type { TestCaseItem } from '../../types';

const noop = jest.fn();

const sampleTestCase: TestCaseItem = {
  id: 'TC-001',
  title: 'Verify login with valid credentials',
  scenarioId: 'SCN-001',
  requirementRefs: ['REQ-1'],
  gherkin: 'Feature: Login\n  Scenario: Valid login\n    Given a user exists\n    When they log in\n    Then they see the dashboard',
  preconditions: ['User exists in system'],
  steps: ['Navigate to /login', 'Enter valid email', 'Enter valid password', 'Click Submit'],
  expectedResult: 'User is redirected to dashboard',
  testData: 'email: test@example.com',
  layer: 'UI',
  priority: 'High',
};

const baseProps = {
  testCases: [],
  xrayPushPreview: null,
  xrayPushProgress: null,
  xrayPushedIssues: [],
  isBusy: false,
  feedback: '',
  onGenerateTestCases: noop,
  onPreviewPush: noop,
  onPushToXray: noop,
  onRetryFailed: noop,
  onClearHistory: noop,
};

describe('TestCasesTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    render(<TestCasesTab {...baseProps} />);
    expect(screen.getByText('Test Cases')).toBeTruthy();
  });

  it('shows empty state when no test cases', () => {
    render(<TestCasesTab {...baseProps} />);
    expect(screen.getByText('No Test Cases Yet')).toBeTruthy();
  });

  it('export buttons are disabled with no test cases', () => {
    render(<TestCasesTab {...baseProps} />);
    const exportFeature = screen.getByText('Export .feature') as HTMLButtonElement;
    const exportCsv = screen.getByText('Export CSV') as HTMLButtonElement;
    expect(exportFeature.disabled).toBe(true);
    expect(exportCsv.disabled).toBe(true);
  });

  it('renders layer filter chips when test cases exist', () => {
    render(<TestCasesTab {...baseProps} testCases={[sampleTestCase]} />);
    // Layer labels appear in both the filter chips and the table — assert at least one of each
    expect(screen.getAllByText('Unit').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('API').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('UI').length).toBeGreaterThanOrEqual(1);
  });

  it('renders gherkin content for matching layer', () => {
    render(<TestCasesTab {...baseProps} testCases={[sampleTestCase]} />);
    expect(screen.getByText(/Verify login with valid credentials/)).toBeTruthy();
  });

  it('renders xray push preview when provided', () => {
    const preview = {
      totalCases: 1, validationErrors: 0, duplicates: 0, willPush: 1,
      details: [{ id: 'TC-001', title: 'Login test', status: 'valid' as const, message: '' }],
    };
    render(<TestCasesTab {...baseProps} testCases={[sampleTestCase]} xrayPushPreview={preview} />);
    expect(screen.getByText('Xray Push Preview')).toBeTruthy();
  });
});
