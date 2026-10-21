type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function formatState<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case 'idle':
      return 'Idle';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded: ${JSON.stringify(state.data)}`;
    case 'error':
      return `Failed: ${state.error.message}`;
    default: {
      const _exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${_exhaustiveCheck}`);
    }
  }
}
