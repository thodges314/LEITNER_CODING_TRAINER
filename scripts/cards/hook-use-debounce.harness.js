const { renderHook, wait } = $dom;
{
  const h = renderHook(({ v }) => useDebounce(v, 60), { initialProps: { v: 'a' } });
  $test.check('Returns the initial value immediately', h.result.current === 'a', h.result.current);
  h.rerender({ v: 'ab' });
  await wait(25);
  const early = h.result.current;
  $test.check('Keeps the old value until the delay has elapsed', early === 'a', early);
  await wait(70);
  $test.check('Updates after the delay has elapsed', h.result.current === 'ab', h.result.current);
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 60), { initialProps: { v: 'a' } });
  h.rerender({ v: 'b' });
  await wait(30);
  h.rerender({ v: 'c' });
  await wait(40); // 70 ms after 'b' (its timer would have fired at 60 ms if it had not been cleared)
  const mid = h.result.current;
  await wait(50);
  $test.check('Rapid changes only surface the last value', mid === 'a' && h.result.current === 'c', { mid, end: h.result.current });
  h.unmount();
}
{
  const h = renderHook(({ v }) => useDebounce(v, 40), { initialProps: { v: 'a' } });
  h.rerender({ v: 'x' });
  h.unmount();
  await wait(80);
  $test.check('Unmounting with a pending update is safe', h.result.current === 'a', h.result.current);
}
