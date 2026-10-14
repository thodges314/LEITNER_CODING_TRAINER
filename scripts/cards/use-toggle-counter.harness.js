const { renderHook, act } = $dom;
{
  const h = renderHook(() => useToggle());
  $test.check('useToggle starts with the initial value (default false)', h.result.current[0] === false, h.result.current[0]);
  h.unmount();
  const h2 = renderHook(() => useToggle(true));
  $test.check('useToggle accepts an initial value', h2.result.current[0] === true, h2.result.current[0]);
  h2.unmount();
}
{
  const h = renderHook(() => useToggle());
  const first = h.result.current[1];
  act(() => h.result.current[1]({ type: 'click' }));
  const afterOne = h.result.current[0];
  act(() => h.result.current[1]());
  $test.check('toggle flips the value, ignores its arguments and keeps a stable identity', afterOne === true && h.result.current[0] === false && h.result.current[1] === first, { afterOne, now: h.result.current[0] });
  h.unmount();
}
{
  const h = renderHook(() => useToggle());
  act(() => h.result.current[2](true));
  const on = h.result.current[0];
  act(() => h.result.current[2](true));
  $test.check('setValue sets the value explicitly', on === true && h.result.current[0] === true, h.result.current[0]);
  h.unmount();
}
{
  const h = renderHook(() => useCounter({ initial: 5 }));
  act(() => h.result.current.increment());
  act(() => h.result.current.increment());
  act(() => h.result.current.decrement());
  const mid = h.result.current.count;
  act(() => h.result.current.reset());
  $test.check('useCounter increments, decrements and resets', mid === 6 && h.result.current.count === 5, { mid, end: h.result.current.count });
  h.unmount();
}
{
  const h = renderHook(() => useCounter({ initial: 0, step: 5, min: 0, max: 12 }));
  act(() => { h.result.current.increment(); h.result.current.increment(); h.result.current.increment(); });
  const top = h.result.current.count;
  act(() => { h.result.current.decrement(); h.result.current.set(-50); });
  const bottom = h.result.current.count;
  const clampedInitial = renderHook(() => useCounter({ initial: 99, max: 10 }));
  $test.check('useCounter respects step, min and max (including the initial value)', top === 12 && bottom === 0 && clampedInitial.result.current.count === 10, { top, bottom, initial: clampedInitial.result.current.count });
  clampedInitial.unmount();
  h.unmount();
}
{
  const h = renderHook(() => useCounter({ initial: 1, step: 2 }));
  const a = h.result.current;
  act(() => h.result.current.increment());
  const b = h.result.current;
  $test.check('useCounter functions keep a stable identity', a.increment === b.increment && a.decrement === b.decrement && a.reset === b.reset && a.set === b.set, 'identities changed');
  h.unmount();
}
