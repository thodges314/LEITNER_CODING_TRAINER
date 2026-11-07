await (async () => {
  const act = typeof $dom !== 'undefined' && typeof $dom.act === 'function'
    ? $dom.act
    : (typeof React.act === 'function' ? React.act : (cb) => cb());

  // Case 1: Mounts hook and provides live result.current across state mutations
  {
    let hookRes;
    act(() => {
      hookRes = renderHook(() => {
        const [count, setCount] = React.useState(0);
        return { count, inc: () => setCount(c => c + 1) };
      });
    });

    const init = hookRes.result.current.count;
    act(() => {
      hookRes.result.current.inc();
    });
    const afterFirst = hookRes.result.current.count;
    act(() => {
      hookRes.result.current.inc();
    });
    const afterSecond = hookRes.result.current.count;
    hookRes.unmount();

    $test.check(
      'Mounts hook and provides live result.current across state mutations',
      init === 0 && afterFirst === 1 && afterSecond === 2,
      { init, afterFirst, afterSecond }
    );
  }

  // Case 2: Re-renders hook with updated initialProps via rerender()
  {
    let hookRes;
    act(() => {
      hookRes = renderHook(({ step }) => {
        const [val, setVal] = React.useState(0);
        return { val, add: () => setVal(v => v + step) };
      }, { initialProps: { step: 5 } });
    });

    act(() => {
      hookRes.result.current.add();
    });
    const firstVal = hookRes.result.current.val;

    act(() => {
      hookRes.rerender({ step: 20 });
    });
    act(() => {
      hookRes.result.current.add();
    });
    const secondVal = hookRes.result.current.val;
    hookRes.unmount();

    $test.check(
      'Re-renders hook with updated initialProps via rerender()',
      firstVal === 5 && secondVal === 25,
      { firstVal, secondVal }
    );
  }

  // Case 3: Executes useEffect cleanup handler on unmount()
  {
    let cleanedUp = false;
    let hookRes;
    act(() => {
      hookRes = renderHook(() => {
        React.useEffect(() => {
          return () => { cleanedUp = true; };
        }, []);
        return true;
      });
    });

    const before = cleanedUp;
    act(() => {
      hookRes.unmount();
    });
    const after = cleanedUp;

    $test.check(
      'Executes useEffect cleanup handler on unmount()',
      before === false && after === true,
      { before, after }
    );
  }

  // Case 4: Wraps test component with custom Context provider wrapper
  {
    const ThemeContext = React.createContext('light');
    const wrapper = ({ children }) => React.createElement(ThemeContext.Provider, { value: 'night-mode' }, children);

    let hookRes;
    act(() => {
      hookRes = renderHook(() => React.useContext(ThemeContext), { wrapper });
    });

    const theme = hookRes.result.current;
    hookRes.unmount();

    $test.check(
      'Wraps test component with custom Context provider wrapper',
      theme === 'night-mode',
      theme
    );
  }
})();
