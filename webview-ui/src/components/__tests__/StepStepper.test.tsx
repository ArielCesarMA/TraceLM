import { render, screen } from '@testing-library/react';
import { StepStepper } from '../StepStepper';

describe('StepStepper', () => {
  it('renders nothing when activeStep is 0', () => {
    const { container } = render(<StepStepper activeStep={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all 4 step labels when active', () => {
    render(<StepStepper activeStep={1} />);
    expect(screen.getByText('Enhancement')).toBeTruthy();
    expect(screen.getByText('Scenarios')).toBeTruthy();
    expect(screen.getByText('Test Cases')).toBeTruthy();
    expect(screen.getByText('Automation')).toBeTruthy();
  });

  it('shows aria-label with current step number', () => {
    render(<StepStepper activeStep={2} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Generating step 2 of 4');
  });

  it('shows all-completed state when activeStep > 4', () => {
    render(<StepStepper activeStep={5} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('All steps completed');
    // All 4 steps should show ✓
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(4);
  });

  it('marks steps before activeStep as completed', () => {
    render(<StepStepper activeStep={3} />);
    // Steps 1 and 2 are completed → show ✓
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(2);
  });
});
