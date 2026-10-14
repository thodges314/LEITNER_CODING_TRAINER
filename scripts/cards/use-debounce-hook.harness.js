const { renderHook, wait } = $dom;
{
  const h = renderHook(({ v }) => useDebounce(v, 60), { initialProps: { v: 'a' } });
  $test.check('Returns the initial value immediately', h.result.current === 'a', h.result.current);
  h.rerender({ v: 'b' });
  await wait(25);
  const early = h.result.current;
  await wait(70);
  $test.check('Waits for the delay before updating', early === 'a' && h.result.current === 'b', { early, late: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 60), { initialProps: { v: 'a' } });
  h.rerender({ v: 'b' });
  await wait(30);
  h.rerender({ v: 'c' });
  await wait(40);
  const mid = h.result.current;
  await wait(50);
  $test.check('Each change restarts the timer', mid === 'a' && h.result.current === 'c', { mid, end: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v, d }) => useDebounce(v, d), { initialProps: { v: 'a', d: 500 } });
  h.rerender({ v: 'b', d: 30 });
  await wait(80);
  $test.check('Uses the latest delay value', h.result.current === 'b', h.result.current);
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 40), { initialProps: { v: 'a' } });
  h.rerender({ v: 'x' });
  h.unmount();
  await wait(80);
  $test.check('Unmounting with a pending update is safe', h.result.current === 'a', h.result.current);
}

{
  const h = renderHook(({ v }) => useThrottle(v, 60), { initialProps: { v: 'a' } });
  $test.check('useThrottle returns the initial value immediately', h.result.current === 'a', h.result.current);
  h.rerender({ v: 'b' });
  h.rerender({ v: 'c' });
  h.rerender({ v: 'd' });
  const early = h.result.current;
  await wait(120);
  const seen = [...new Set(h.result.history)];
  $test.check(
    'useThrottle delivers only the latest value at the end of the interval',
    early === 'a' && h.result.current === 'd' && seen.join() === 'a,d',
    { early, end: h.result.current, seen }
  );
  await wait(80);
  h.rerender({ v: 'e' });
  $test.check('useThrottle applies a change immediately once the interval has elapsed', h.result.current === 'e', h.result.current);
  h.unmount();
}
