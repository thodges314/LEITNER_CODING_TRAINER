const { renderHook, wait } = $dom;
const until = async (fn, ms = 2000) => {
  const start = Date.now();
  while (!fn() && Date.now() - start < ms) await wait(15);
  return fn();
};

{
  const h = renderHook(({ v }) => useDebounce(v, 180), { initialProps: { v: 'a' } });
  $test.check('Returns the initial value immediately', h.result.current === 'a', h.result.current);
  h.rerender({ v: 'b' });
  const early = h.result.current;
  const late = await until(() => h.result.current === 'b', 2000);
  $test.check('Waits for the delay before updating', early === 'a' && late, { early, late: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 240), { initialProps: { v: 'a' } });
  h.rerender({ v: 'b' });
  await wait(80);
  h.rerender({ v: 'c' });
  const mid = h.result.current;
  const end = await until(() => h.result.current === 'c', 2000);
  $test.check('Each change restarts the timer', mid === 'a' && end, { mid, end: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v, d }) => useDebounce(v, d), { initialProps: { v: 'a', d: 1500 } });
  h.rerender({ v: 'b', d: 90 });
  const updated = await until(() => h.result.current === 'b', 2000);
  $test.check('Uses the latest delay value', updated, h.result.current);
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 120), { initialProps: { v: 'a' } });
  h.rerender({ v: 'x' });
  h.unmount();
  await wait(240);
  $test.check('Unmounting with a pending update is safe', h.result.current === 'a', h.result.current);
}

{
  const h = renderHook(({ v }) => useThrottle(v, 240), { initialProps: { v: 'a' } });
  $test.check('useThrottle returns the initial value immediately', h.result.current === 'a', h.result.current);
  h.rerender({ v: 'b' });
  h.rerender({ v: 'c' });
  h.rerender({ v: 'd' });
  const early = h.result.current;
  const throttled = await until(() => h.result.current === 'd', 2000);
  const seen = [...new Set(h.result.history)];
  $test.check(
    'useThrottle delivers only the latest value at the end of the interval',
    early === 'a' && throttled && seen.join() === 'a,d',
    { early, end: h.result.current, seen }
  );
  await wait(300);
  h.rerender({ v: 'e' });
  const applied = await until(() => h.result.current === 'e', 180);
  $test.check('useThrottle applies a change immediately once the interval has elapsed', applied, h.result.current);
  h.unmount();
}

