import { render, screen } from '@testing-library/react';
import { EnhancementTab } from '../EnhancementTab';
import { emptyEnhancement } from '../../types';

const noop = jest.fn();

const baseProps = {
  enhancement: emptyEnhancement,
  isBusy: false,
  feedback: '',
  onGenerate: noop,
};

describe('EnhancementTab', () => {
  it('renders without crashing', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText('Requirement Enhancement')).toBeTruthy();
  });

  it('renders Generate Enhancement button', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText('Generate Enhancement')).toBeTruthy();
  });

  it('renders all six card headers', () => {
    render(<EnhancementTab {...baseProps} />);
    expect(screen.getByText(/Missing Functional/)).toBeTruthy();
    expect(screen.getByText(/Missing Non-Functional/)).toBeTruthy();
    expect(screen.getByText(/Best Practices/)).toBeTruthy();
    expect(screen.getByText(/Market Benchmark/)).toBeTruthy();
    expect(screen.getByText(/Risks/)).toBeTruthy();
    expect(screen.getByText(/Clarifying Questions/)).toBeTruthy();
  });

  it('shows item count badge when enhancement has items', () => {
    render(<EnhancementTab {...baseProps} enhancement={{ ...emptyEnhancement, risks: ['Risk A', 'Risk B'] }} />);
    expect(screen.getByText('(2)')).toBeTruthy();
  });

  it('renders feedback text', () => {
    render(<EnhancementTab {...baseProps} feedback="Requirement enhancement complete." />);
    expect(screen.getByText('Requirement enhancement complete.')).toBeTruthy();
  });
});
