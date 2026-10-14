const { render, q, qa } = $dom;
function Bomb({ message = 'boom' }) {
  throw new Error(message);
}
{
  const r = render(<SimpleErrorBoundary fallback={<p>oops</p>}><p id="ok">fine</p></SimpleErrorBoundary>);
  $test.check('Renders its children when nothing throws', q('#ok', r.container) !== null && r.container.textContent === 'fine', r.container.innerHTML);
  r.unmount();
}
{
  const r = render(<SimpleErrorBoundary fallback={<p id="fb">oops</p>}><Bomb /></SimpleErrorBoundary>);
  $test.check('Shows the fallback when a child throws', q('#fb', r.container) !== null && r.container.textContent === 'oops', r.container.innerHTML);
  r.unmount();
}
{
  const r = render(
    <div>
      <section id="one"><SimpleErrorBoundary fallback={<p>failed</p>}><Bomb /></SimpleErrorBoundary></section>
      <section id="two"><SimpleErrorBoundary fallback={<p>failed</p>}><p>healthy</p></SimpleErrorBoundary></section>
    </div>
  );
  $test.check('An error in one boundary does not affect a sibling boundary', q('#one', r.container).textContent === 'failed' && q('#two', r.container).textContent === 'healthy', r.container.innerHTML);
  r.unmount();
}
{
  const seen = [];
  const r = render(<SimpleErrorBoundary fallback={<p>x</p>} onError={(e) => seen.push(e.message)}><Bomb message="kaput" /></SimpleErrorBoundary>);
  $test.check('onError is called once with the error', seen.join() === 'kaput', seen);
  r.unmount();
}
