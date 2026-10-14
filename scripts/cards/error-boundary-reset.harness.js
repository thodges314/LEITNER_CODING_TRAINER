const { render, fire, q } = $dom;
let shouldThrow = true;
function Bomb() {
  if (shouldThrow) throw new Error('boom');
  return <p id="ok">all good</p>;
}
{
  shouldThrow = false;
  const r = render(<ErrorBoundary fallback={<p>oops</p>}><Bomb /></ErrorBoundary>);
  $test.check('Renders its children when nothing throws', q('#ok', r.container) !== null && q('#ok', r.container).textContent === 'all good', r.container.innerHTML);
  r.unmount();
}
{
  shouldThrow = true;
  const r = render(<ErrorBoundary fallback={(error) => <p id="fb">failed: {error.message}</p>}><Bomb /></ErrorBoundary>);
  $test.check('Shows the fallback (called with the error) when a child throws', q('#fb', r.container) !== null && q('#fb', r.container).textContent === 'failed: boom' && q('#ok', r.container) === null, r.container.innerHTML);
  r.unmount();
}
{
  shouldThrow = true;
  const seen = [];
  const r = render(<ErrorBoundary fallback={<p>oops</p>} onError={(error, info) => seen.push([error.message, typeof info.componentStack])}><Bomb /></ErrorBoundary>);
  $test.check('onError receives the error and React error info, once', seen.length === 1 && seen[0][0] === 'boom' && seen[0][1] === 'string', seen);
  r.unmount();
}
{
  shouldThrow = true;
  const r = render(<ErrorBoundary fallback={(error, reset) => <button id="retry" onClick={reset}>retry</button>}><Bomb /></ErrorBoundary>);
  shouldThrow = false;
  fire.click(q('#retry', r.container));
  $test.check('reset() from the fallback retries the children', q('#ok', r.container) !== null && q('#retry', r.container) === null, r.container.innerHTML);
  r.unmount();
}
{
  shouldThrow = true;
  const make = (key) => <ErrorBoundary resetKeys={[key]} fallback={<p id="fb">oops</p>}><Bomb /></ErrorBoundary>;
  const r = render(make(1));
  const showing = q('#fb', r.container) !== null;
  shouldThrow = false;
  r.rerender(make(1));
  const stillShowing = q('#fb', r.container) !== null;
  r.rerender(make(2));
  $test.check('Changing resetKeys resets the boundary automatically', showing && stillShowing && q('#ok', r.container) !== null, r.container.innerHTML);
  r.unmount();
}
{
  shouldThrow = true;
  const r = render(<ErrorBoundary fallback={<p id="fb">static fallback</p>}><Bomb /></ErrorBoundary>);
  $test.check('A plain element works as the fallback', q('#fb', r.container) !== null && q('#fb', r.container).textContent === 'static fallback', r.container.innerHTML);
  r.unmount();
}
