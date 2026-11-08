await (async () => {
  const act = typeof $dom !== 'undefined' && typeof $dom.act === 'function'
    ? $dom.act
    : (typeof React.act === 'function' ? React.act : (cb) => cb());

  const fn = typeof renderHook === 'function' ? renderHook : (typeof solution === 'function' ? solution : solution?.renderHook);
  if (typeof fn !== 'function') {
    $test.check('Mounts hook and provides live result.current across state mutations', false, { error: 'renderHook is not defined as a function' });
    $test.check('Re-renders hook with updated initialProps via rerender()', false, { error: 'renderHook is not defined as a function' });
    $test.check('Executes useEffect cleanup handler on unmount()', false, { error: 'renderHook is not defined as a function' });
    $test.check('Wraps test component with custom Context provider wrapper', false, { error: 'renderHook is not defined as a function' });
    return;
  }

  // Case 1: Mounts hook and provides live result.current across state mutations
  try {
    let hookRes;
    await act(async () => {
      hookRes = fn(() => {
        const [count, setCount] = React.useState(0);
        return { count, inc: () => setCount((c) => c + 1) };
      });
    });

    const init = hookRes?.result?.current?.count;
    await act(async () => {
      hookRes?.result?.current?.inc?.();
    });
    const afterFirst = hookRes?.result?.current?.count;
    await act(async () => {
      hookRes?.result?.current?.inc?.();
    });
    const afterSecond = hookRes?.result?.current?.count;
    hookRes?.unmount?.();

    $test.check(
      'Mounts hook and provides live result.current across state mutations',
      init === 0 && afterFirst === 1 && afterSecond === 2,
      { init, afterFirst, afterSecond }
    );
  } catch (err) {
    $test.check('Mounts hook and provides live result.current across state mutations', false, { error: err?.message || String(err) });
  }

  // Case 2: Re-renders hook with updated initialProps via rerender()
  try {
    let hookRes;
    await act(async () => {
      hookRes = fn(({ step }) => {
        const [val, setVal] = React.useState(0);
        return { val, add: () => setVal((v) => v + step) };
      }, { initialProps: { step: 5 } });
    });

    await act(async () => {
      hookRes?.result?.current?.add?.();
    });
    const firstVal = hookRes?.result?.current?.val;

    await act(async () => {
      hookRes?.rerender?.({ step: 20 });
    });
    await act(async () => {
      hookRes?.result?.current?.add?.();
    });
    const secondVal = hookRes?.result?.current?.val;
    hookRes?.unmount?.();

    $test.check(
      'Re-renders hook with updated initialProps via rerender()',
      firstVal === 5 && secondVal === 25,
      { firstVal, secondVal }
    );
  } catch (err) {
    $test.check('Re-renders hook with updated initialProps via rerender()', false, { error: err?.message || String(err) });
  }

  // Case 3: Executes useEffect cleanup handler on unmount()
  try {
    let cleanedUp = false;
    let hookRes;
    await act(async () => {
      hookRes = fn(() => {
        React.useEffect(() => {
          return () => { cleanedUp = true; };
        }, []);
        return true;
      });
    });

    const before = cleanedUp;
    await act(async () => {
      hookRes?.unmount?.();
    });
    const after = cleanedUp;

    $test.check(
      'Executes useEffect cleanup handler on unmount()',
      before === false && after === true,
      { before, after }
    );
  } catch (err) {
    $test.check('Executes useEffect cleanup handler on unmount()', false, { error: err?.message || String(err) });
  }

  // Case 4: Wraps test component with custom Context provider wrapper
  try {
    const ThemeContext = React.createContext('light');
    const wrapper = ({ children }) => React.createElement(ThemeContext.Provider, { value: 'night-mode' }, children);

    let hookRes;
    await act(async () => {
      hookRes = fn(() => React.useContext(ThemeContext), { wrapper });
    });

    const theme = hookRes?.result?.current;
    hookRes?.unmount?.();

    $test.check(
      'Wraps test component with custom Context provider wrapper',
      theme === 'night-mode',
      theme
    );
  } catch (err) {
    $test.check('Wraps test component with custom Context provider wrapper', false, { error: err?.message || String(err) });
  }
})();
