const { renderHook, act } = $dom;
{
  const h = renderHook(() => useHistory('a'));
  $test.check('Starts with the initial state and nothing to undo or redo', h.result.current.state === 'a' && !h.result.current.canUndo && !h.result.current.canRedo, h.result.current);
  act(() => h.result.current.undo());
  act(() => h.result.current.redo());
  $test.check('undo and redo do nothing at the ends', h.result.current.state === 'a', h.result.current.state);
  h.unmount();
}
{
  const h = renderHook(() => useHistory('a'));
  act(() => h.result.current.set('b'));
  $test.check('set pushes a new state and enables undo', h.result.current.state === 'b' && h.result.current.canUndo && !h.result.current.canRedo, h.result.current);
  h.unmount();
}
{
  const h = renderHook(() => useHistory(0));
  act(() => h.result.current.set(1));
  act(() => h.result.current.set(2));
  act(() => h.result.current.undo());
  const back = h.result.current.state;
  act(() => h.result.current.undo());
  const back2 = h.result.current.state;
  act(() => h.result.current.redo());
  $test.check('undo and redo walk back and forth', back === 1 && back2 === 0 && h.result.current.state === 1 && h.result.current.canRedo, { back, back2, now: h.result.current.state });
  h.unmount();
}
{
  const h = renderHook(() => useHistory(0));
  act(() => h.result.current.set(1));
  act(() => h.result.current.set(2));
  act(() => h.result.current.undo());
  act(() => h.result.current.set(99));
  $test.check('set after undo discards the redo branch', h.result.current.state === 99 && !h.result.current.canRedo, h.result.current);
  h.unmount();
}
{
  const h = renderHook(() => useHistory(5));
  act(() => h.result.current.set((n) => n + 1));
  act(() => h.result.current.set(6));
  act(() => h.result.current.undo());
  $test.check('set accepts an updater function and ignores an unchanged value', h.result.current.state === 5 && !h.result.current.canUndo, h.result.current);
  h.unmount();
}
{
  const h = renderHook(() => useHistory(0, 2));
  act(() => h.result.current.set(1));
  act(() => h.result.current.set(2));
  act(() => h.result.current.set(3));
  act(() => h.result.current.undo());
  act(() => h.result.current.undo());
  act(() => h.result.current.undo());
  $test.check('limit drops the oldest history entries', h.result.current.state === 1 && !h.result.current.canUndo, h.result.current.state);
  h.unmount();
}
{
  const h = renderHook(() => useHistory(0));
  const a = h.result.current;
  act(() => a.set(1));
  const b = h.result.current;
  $test.check('set, undo and redo keep a stable identity', a.set === b.set && a.undo === b.undo && a.redo === b.redo, 'identity changed');
  h.unmount();
}
