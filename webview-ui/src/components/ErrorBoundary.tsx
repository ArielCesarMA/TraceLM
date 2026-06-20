import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; tabName: string };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[TraceLM] Error in ${this.props.tabName} tab:`, error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p className="error-boundary-title">Something went wrong in the {this.props.tabName} tab.</p>
          <p className="error-boundary-detail">{this.state.error?.message}</p>
          <button type="button" onClick={this.handleReset}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
