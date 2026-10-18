const { render, q, qa, act, wait } = $dom;
// Text that is actually on screen: React hides suspended content with display:none.
const visibleText = (el) => {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) out += node.textContent;
    else if (node.nodeType === 1 && node.style.display !== 'none') out += visibleText(node);
  }
  return out;
};
const mountAsync = async (ui) => {
  let r;
  await act(async () => { r = render(ui); });
  return {
    container: r.container,
    rerender: async (next) => { await act(async () => { r.rerender(next); }); },
    unmount: async () => { await act(async () => { r.unmount(); }); },
  };
};
const click = async (el) => {
  await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
};
// Poll until the condition holds (React retries suspended renders on its own schedule).
const waitFor = async (cond, ms = 2000) => {
  const end = Date.now() + ms;
  while (!cond() && Date.now() < end) {
    await act(async () => { await new Promise((res) => setTimeout(res, 15)); });
  }
  return cond();
};
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? <p id="boundary">{'boundary: ' + this.state.error.message}</p> : this.props.children;
  }
}
{
  const d = deferred();
  const r = await mountAsync(<UserBadge userPromise={d.promise} />);
  $test.check('Shows the fallback while the promise is pending', visibleText(r.container) === 'Loading…', visibleText(r.container));
  await r.unmount();
}
{
  const d = deferred();
  const r = await mountAsync(<UserBadge userPromise={d.promise} />);
  await act(async () => { d.resolve({ name: 'Ada', role: 'admin' }); });
  await waitFor(() => visibleText(r.container) === 'Ada (admin)');
  $test.check('Shows the resolved user once the promise resolves', visibleText(r.container) === 'Ada (admin)', visibleText(r.container));
  await r.unmount();
}
{
  const d = deferred();
  const r = await mountAsync(<UserBadge userPromise={d.promise} />);
  await act(async () => { d.resolve({ name: 'Ada', role: 'admin' }); });
  await waitFor(() => visibleText(r.container) === 'Ada (admin)');
  await r.rerender(<UserBadge userPromise={d.promise} />);
  $test.check('Re-rendering with the same promise does not show the fallback again', visibleText(r.container) === 'Ada (admin)', visibleText(r.container));
  await r.unmount();
}
{
  const a = deferred();
  const b = deferred();
  const r = await mountAsync(<UserBadge userPromise={a.promise} />);
  await act(async () => { a.resolve({ name: 'Ada', role: 'admin' }); });
  await waitFor(() => visibleText(r.container) === 'Ada (admin)');
  await r.rerender(<UserBadge userPromise={b.promise} />);
  const during = visibleText(r.container);
  await act(async () => { b.resolve({ name: 'Grace', role: 'dev' }); });
  await waitFor(() => visibleText(r.container) === 'Grace (dev)');
  $test.check('A new promise shows the fallback again, then the new user', during === 'Loading…' && visibleText(r.container) === 'Grace (dev)', [during, visibleText(r.container)]);
  await r.unmount();
}
{
  const d = deferred();
  d.promise.catch(() => {});
  const realError = console.error;
  console.error = () => {};
  try {
    const r = await mountAsync(<Boundary><UserBadge userPromise={d.promise} /></Boundary>);
    await act(async () => { d.reject(new Error('nope')); });
    await waitFor(() => !!q('#boundary', r.container));
    const b = q('#boundary', r.container);
    $test.check('A rejected promise reaches the nearest error boundary instead of being swallowed', !!b && b.textContent === 'boundary: nope', visibleText(r.container));
    await r.unmount();
  } finally {
    console.error = realError;
  }
}
