import { Component } from 'react';
import type { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ReactTestErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚠️ React Component Render Exception</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fca5a5', lineHeight: 1.5 }}>
            {this.state.error?.name}: {this.state.error?.message}
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '12px', fontSize: '11px', padding: '4px 10px', height: 'auto' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
