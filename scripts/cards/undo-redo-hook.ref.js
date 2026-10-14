function useHistory(initial, limit = 100) {
  const [history, setHistory] = useState({ past: [], present: initial, future: [] });

  const set = useCallback(
    (next) =>
      setHistory((h) => {
        const value = typeof next === 'function' ? next(h.present) : next;
        if (Object.is(value, h.present)) return h;
        return { past: [...h.past, h.present].slice(-limit), present: value, future: [] };
      }),
    [limit]
  );

  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length === 0
          ? h
          : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
      ),
    []
  );

  const redo = useCallback(
    () =>
      setHistory((h) =>
        h.future.length === 0
          ? h
          : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
      ),
    []
  );

  return { state: history.present, set, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 };
}
