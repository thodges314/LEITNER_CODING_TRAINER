const { renderHook, fire, act } = $dom;
const KEY = 'lc-test-key';
const cleanup = () => localStorage.removeItem(KEY);
cleanup();
{
  const h = renderHook(() => useLocalStorage(KEY, 'init'));
  $test.check('Uses the initial value when nothing is stored', h.result.current[0] === 'init', h.result.current[0]);
  h.unmount();
}
{
  localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
  const h = renderHook(() => useLocalStorage(KEY, null));
  $test.check('Reads an existing JSON value on mount', JSON.stringify(h.result.current[0]) === '{"a":1}', h.result.current[0]);
  h.unmount();
  cleanup();
}
{
  const h = renderHook(() => useLocalStorage(KEY, 0));
  act(() => h.result.current[1](5));
  $test.check('setValue updates state and stores JSON', h.result.current[0] === 5 && localStorage.getItem(KEY) === '5', { state: h.result.current[0], stored: localStorage.getItem(KEY) });
  h.unmount();
  cleanup();
}
{
  const h = renderHook(() => useLocalStorage(KEY, 0));
  act(() => {
    h.result.current[1]((n) => n + 1);
    h.result.current[1]((n) => n + 1);
  });
  $test.check('setValue accepts an updater function (two calls in one batch)', h.result.current[0] === 2 && localStorage.getItem(KEY) === '2', { state: h.result.current[0], stored: localStorage.getItem(KEY) });
  h.unmount();
  cleanup();
}
{
  localStorage.setItem(KEY, '{not valid json');
  const h = renderHook(() => useLocalStorage(KEY, 'safe'));
  $test.check('Falls back to the initial value when the stored JSON is corrupt', h.result.current[0] === 'safe', h.result.current[0]);
  h.unmount();
  cleanup();
}
{
  const h = renderHook(() => useLocalStorage(KEY, 'init'));
  fire.event(window, new StorageEvent('storage', { key: KEY, newValue: JSON.stringify('from another tab') }));
  const updated = h.result.current[0];
  fire.event(window, new StorageEvent('storage', { key: KEY, newValue: null }));
  $test.check(
    'A storage event for the same key updates the value (removal restores the initial value)',
    updated === 'from another tab' && h.result.current[0] === 'init',
    { updated, afterRemoval: h.result.current[0] }
  );
  h.unmount();
}
{
  const h = renderHook(() => useLocalStorage(KEY, 'init'));
  fire.event(window, new StorageEvent('storage', { key: 'some-other-key', newValue: JSON.stringify('nope') }));
  $test.check('Storage events for other keys are ignored', h.result.current[0] === 'init', h.result.current[0]);
  h.unmount();
}
{
  localStorage.setItem(KEY + '-b', JSON.stringify('B'));
  const h = renderHook(({ k }) => useLocalStorage(k, 'init'), { initialProps: { k: KEY } });
  h.rerender({ k: KEY + '-b' });
  $test.check('Changing the key reads the new key', h.result.current[0] === 'B', h.result.current[0]);
  h.unmount();
  localStorage.removeItem(KEY + '-b');
}
