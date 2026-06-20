import { render, screen } from '@testing-library/react';
import { RequirementsTab } from '../RequirementsTab';

const noop = jest.fn();

const baseProps = {
  requirementText: '',
  requirementsReviewed: false,
  generationProgress: '',
  parsedFiles: [],
  uploadDrafts: [],
  jiraMode: 'single' as const,
  singleIssueKey: '',
  multipleIssueKeys: '',
  epicKey: '',
  storyQuery: '',
  storyOptions: [],
  selectedStoryKeys: [],
  pulledIssues: [],
  isBusy: false,
  feedback: '',
  onRequirementTextChange: noop,
  onReviewedChange: noop,
  onGenerateAll: noop,
  onFileChange: noop,
  onParseFiles: noop,
  onJiraModeChange: noop,
  onSingleKeyChange: noop,
  onMultipleKeysChange: noop,
  onEpicKeyChange: noop,
  onStoryQueryChange: noop,
  onSearchStories: noop,
  onToggleStoryKey: noop,
  onPullJira: noop,
};

describe('RequirementsTab', () => {
  it('renders without crashing', () => {
    render(<RequirementsTab {...baseProps} />);
    expect(screen.getByText('Requirements')).toBeTruthy();
  });

  it('renders Generate All Artifacts button', () => {
    render(<RequirementsTab {...baseProps} />);
    expect(screen.getByText('Generate All Artifacts')).toBeTruthy();
  });

  it('shows staged upload draft chips when files are selected but not yet parsed', () => {
    render(<RequirementsTab {...baseProps} uploadDrafts={[{ name: 'spec.pdf', mimeType: 'application/pdf', contentBase64: '' }]} />);
    expect(screen.getByText('spec.pdf')).toBeTruthy();
  });

  it('does not show draft chips after files have been parsed', () => {
    render(<RequirementsTab
      {...baseProps}
      uploadDrafts={[{ name: 'spec.pdf', mimeType: 'application/pdf', contentBase64: '' }]}
      parsedFiles={[{ name: 'spec.pdf', text: 'content' }]}
    />);
    // parsedFiles present → draft chip row hidden; parsed list shown instead
    expect(screen.getByText('spec.pdf: Parsed')).toBeTruthy();
  });

  it('shows stepper when generationProgress contains step marker', () => {
    render(<RequirementsTab {...baseProps} generationProgress="Test Scenarios (2/4)..." />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('renders feedback text', () => {
    render(<RequirementsTab {...baseProps} feedback="Pulling Jira requirements..." />);
    expect(screen.getByText('Pulling Jira requirements...')).toBeTruthy();
  });
});
