interface SimpleErrorBoundaryProps {
  fallback: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
  children: React.ReactNode;
}

interface SimpleErrorBoundaryState {
  error: Error | null;
}

class SimpleErrorBoundary extends React.Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  state: SimpleErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SimpleErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }

    return children;
  }
}
