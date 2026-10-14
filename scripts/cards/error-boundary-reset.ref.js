class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info);
  }

  componentDidUpdate(prevProps) {
    const { resetKeys } = this.props;
    const prevKeys = prevProps.resetKeys;
    if (
      this.state.error !== null &&
      resetKeys &&
      prevKeys &&
      (resetKeys.length !== prevKeys.length || resetKeys.some((key, i) => !Object.is(key, prevKeys[i])))
    ) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error === null) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === 'function' ? fallback(this.state.error, this.reset) : (fallback ?? null);
  }
}
