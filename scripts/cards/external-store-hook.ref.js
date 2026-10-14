function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(partial) {
      const patch = typeof partial === 'function' ? partial(state) : partial;
      const next = { ...state, ...patch };
      const changed = Object.keys(next).some((k) => !Object.is(next[k], state[k]));
      if (!changed) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function useStore(store, selector = (state) => state) {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
