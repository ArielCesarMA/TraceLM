import { render, screen } from '@testing-library/react';
import { SettingsTab } from '../SettingsTab';
import { defaultSettings } from '../../types';

const noop = jest.fn();

const baseProps = {
  settings: defaultSettings,
  availableModels: ['gpt-4o', 'gpt-4o-mini'],
  isBusy: false,
  feedback: '',
  onFieldChange: noop,
  onSave: noop,
  onTestLlm: noop,
  onTestJira: noop,
};

describe('SettingsTab', () => {
  it('renders without crashing', () => {
    render(<SettingsTab {...baseProps} />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders all three action buttons', () => {
    render(<SettingsTab {...baseProps} />);
    expect(screen.getByText('Save Settings')).toBeTruthy();
    expect(screen.getByText('Test LLM')).toBeTruthy();
    expect(screen.getByText('Test Jira/Xray')).toBeTruthy();
  });

  it('disables buttons when isBusy', () => {
    render(<SettingsTab {...baseProps} isBusy={true} />);
    const saveBtn = screen.getByText('Save Settings') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('renders feedback text', () => {
    render(<SettingsTab {...baseProps} feedback="Settings saved successfully." />);
    expect(screen.getByText('Settings saved successfully.')).toBeTruthy();
  });
});
