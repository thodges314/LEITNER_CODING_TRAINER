type Listener<T> = (state: T) => void;
type Unsubscribe = () => void;

interface Store<T> {
  getState(): T;
  setState(partial: Partial<T> | Record<string, unknown>): void;
  subscribe(listener: Listener<T>): Unsubscribe;
}

function createStore<T extends Record<string, unknown>>(initialState: T): Store<T> {
  let state: T = initialState;
  const listeners = new Set<Listener<T>>();

  return {
    getState(): T {
      return state;
    },
    setState(partial: Partial<T> | Record<string, unknown>): void {
      state = { ...state, ...partial } as T;
      for (const listener of [...listeners]) listener(state);
    },
    subscribe(listener: Listener<T>): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
