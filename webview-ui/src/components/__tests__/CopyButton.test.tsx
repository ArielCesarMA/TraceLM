import { render, screen, fireEvent, act } from '@testing-library/react';
import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    // Mock clipboard API (not available in jsdom by default)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('renders without crashing', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls clipboard.writeText with the provided text on click', async () => {
    render(<CopyButton text="copy me" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
  });

  it('shows copied indicator after click', async () => {
    render(<CopyButton text="hi" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByText('✓')).toBeTruthy();
  });
});
