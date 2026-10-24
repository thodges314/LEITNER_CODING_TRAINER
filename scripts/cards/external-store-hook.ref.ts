type Listener = () => void;
type Unsubscribe = () => void;

type SetStateArg<T> = Partial<T> | ((state: T) => Partial<T>);

interface ExternalStore<T> {
  getState: () => T;
  setState: (partial: SetStateArg<T>) => void;
  subscribe: (listener: Listener) => Unsubscribe;
}

function createStore<T extends Record<string, unknown>>(initialState: T): ExternalStore<T> {
  let state: T = initialState;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(partial: SetStateArg<T>): void {
      const patch = typeof partial === 'function' ? partial(state) : partial;
      const next: T = { ...state, ...patch };
      const changed = (Object.keys(next) as Array<keyof T>).some((k) => !Object.is(next[k], state[k]));
      if (!changed) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function useStore<T extends Record<string, unknown>, S = T>(
  store: ExternalStore<T>,
  selector: (state: T) => S = (state: T) => state as unknown as S
): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
