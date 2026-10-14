const { renderHook } = $dom;
{
  const h = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 1 } });
  $test.check('First render has no previous value', h.result.current === undefined, h.result.current);
  h.rerender({ v: 2 });
  const second = h.result.current;
  h.rerender({ v: 3 });
  $test.check('Returns the value from the previous render', second === 1 && h.result.current === 2, { second, third: h.result.current });
  h.rerender({ v: 3 });
  $test.check('Re-rendering with the same value returns it', h.result.current === 3, h.result.current);
  h.unmount();
}
{
  const a = { id: 1 };
  const b = { id: 2 };
  const h = renderHook(({ v }) => usePrevious(v), { initialProps: { v: a } });
  h.rerender({ v: b });
  $test.check('Works with objects (same reference)', h.result.current === a);
  h.unmount();
}
