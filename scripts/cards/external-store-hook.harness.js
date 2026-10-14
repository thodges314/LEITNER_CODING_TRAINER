const { render, act, q } = $dom;
{
  const store = createStore({ count: 0, name: 'Ada' });
  store.setState({ count: 1 });
  store.setState((s) => ({ count: s.count + 1 }));
  $test.check('setState shallow-merges a partial or an updater result', JSON.stringify(store.getState()) === '{"count":2,"name":"Ada"}', store.getState());
}
{
  const store = createStore({ n: 0 });
  const seen = [];
  const off = store.subscribe(() => seen.push(store.getState().n));
  store.setState({ n: 1 });
  off();
  store.setState({ n: 2 });
  $test.check('subscribe notifies listeners until the returned unsubscribe is called', seen.join() === '1', seen);
}
{
  const store = createStore({ n: 0 });
  let calls = 0;
  store.subscribe(() => calls++);
  store.setState({ n: 0 });
  store.setState((s) => ({ n: s.n }));
  store.setState({ n: 1 });
  $test.check('setState does not notify when no value changed', calls === 1, calls);
}
function Count({ store }) {
  const count = useStore(store, (s) => s.count);
  return <p id="count">count: {count}</p>;
}
{
  const store = createStore({ count: 0, name: 'Ada' });
  const r = render(<Count store={store} />);
  const first = q('#count', r.container).textContent;
  act(() => store.setState({ count: 5 }));
  $test.check('useStore renders the selected slice and updates on change', first === 'count: 0' && q('#count', r.container).textContent === 'count: 5', { first, now: q('#count', r.container).textContent });
  r.unmount();
}
{
  const store = createStore({ count: 0, name: 'Ada' });
  let countRenders = 0;
  let nameRenders = 0;
  function CountView() {
    const count = useStore(store, (s) => s.count);
    countRenders++;
    return <span>{count}</span>;
  }
  function NameView() {
    const name = useStore(store, (s) => s.name);
    nameRenders++;
    return <span>{name}</span>;
  }
  const r = render(<><CountView /><NameView /></>);
  const baseName = nameRenders;
  act(() => store.setState({ count: 1 }));
  act(() => store.setState({ count: 2 }));
  $test.check('A component re-renders only when its selected slice changes', nameRenders === baseName && countRenders >= 3, { countRenders, nameRenders, baseName });
  r.unmount();
}
{
  const store = createStore({ count: 0 });
  let active = 0;
  const original = store.subscribe;
  store.subscribe = (listener) => {
    active++;
    const off = original(listener);
    return () => {
      active--;
      off();
    };
  };
  const r = render(<Count store={store} />);
  const mounted = active;
  r.unmount();
  $test.check('useStore unsubscribes on unmount', mounted === 1 && active === 0, { mounted, after: active });
}
