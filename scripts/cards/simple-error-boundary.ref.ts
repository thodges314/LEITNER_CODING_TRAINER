interface SimpleErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: unknown) => void;
  children?: React.ReactNode;
}

interface SimpleErrorBoundaryState {
  failed: boolean;
}

class SimpleErrorBoundary extends React.Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  state: SimpleErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SimpleErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    if (this.props.onError) this.props.onError(error);
  }

  render(): React.ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
