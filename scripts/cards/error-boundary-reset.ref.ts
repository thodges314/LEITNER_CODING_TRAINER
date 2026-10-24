type FallbackRender = (error: unknown, reset: () => void) => React.ReactNode;

interface ErrorBoundaryProps {
  fallback?: React.ReactNode | FallbackRender;
  onError?: (error: unknown, info: React.ErrorInfo) => void;
  resetKeys?: unknown[];
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: unknown | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    if (this.props.onError) this.props.onError(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const prevKeys = prevProps.resetKeys;
    if (
      this.state.error !== null &&
      resetKeys &&
      prevKeys &&
      (resetKeys.length !== prevKeys.length || resetKeys.some((key: unknown, i: number) => !Object.is(key, prevKeys[i])))
    ) {
      this.reset();
    }
  }

  reset = (): void => this.setState({ error: null });

  render(): React.ReactNode {
    if (this.state.error === null) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === 'function' ? (fallback as FallbackRender)(this.state.error, this.reset) : (fallback ?? null);
  }
}
