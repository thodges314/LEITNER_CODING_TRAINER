const { renderHook, wait } = $dom;
{
  const h = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 1 } });
  const first = h.result.current;
  h.rerender({ v: 2 });
  const second = h.result.current;
  h.rerender({ v: 3 });
  $test.check('usePrevious returns the previous value', first === undefined && second === 1 && h.result.current === 2, { first, second, third: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v }) => useLatest(v), { initialProps: { v: 'one' } });
  const ref = h.result.current;
  h.rerender({ v: 'two' });
  $test.check('useLatest keeps one stable ref holding the newest value', h.result.current === ref && ref.current === 'two', ref.current);
  h.unmount();
}
{
  let a = 0;
  const h = renderHook(({ cb, d }) => useInterval(cb, d), { initialProps: { cb: () => a++, d: 30 } });
  await wait(110);
  const ticks = a;
  h.unmount();
  await wait(70);
  $test.check('useInterval ticks at the given delay and stops on unmount', ticks >= 2 && ticks <= 4 && a === ticks, { ticks, after: a });
}
{
  let a = 0;
  let b = 0;
  const h = renderHook(({ cb, d }) => useInterval(cb, d), { initialProps: { cb: () => a++, d: 60 } });
  await wait(35);
  h.rerender({ cb: () => b++, d: 60 }); // new callback at ~35 ms; the 60 ms tick must not be postponed
  await wait(45); // ~80 ms: the original timer has ticked once, using the new callback
  $test.check('useInterval always calls the latest callback without resetting the timer', a === 0 && b === 1, { a, b });
  h.unmount();
}
{
  let a = 0;
  const h = renderHook(({ cb, d }) => useInterval(cb, d), { initialProps: { cb: () => a++, d: null } });
  await wait(90);
  $test.check('A null delay pauses the interval', a === 0, a);
  h.rerender({ cb: () => a++, d: 30 });
  await wait(100);
  $test.check('Switching from null to a delay resumes', a >= 2, a);
  h.unmount();
}
