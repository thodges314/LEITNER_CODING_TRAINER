const { render, q, observers, intersect } = $dom;
function Probe({ onLoadMore }) {
  const ref = useInfiniteScroll(onLoadMore);
  return (
    <div>
      <p>content</p>
      <div ref={ref} id="sentinel" />
    </div>
  );
}
{
  const calls = [];
  const { container, rerender, unmount } = render(<Probe onLoadMore={() => calls.push('a')} />);
  const obs = observers();
  $test.check('Observes the sentinel element', obs.length === 1 && obs[0].elements.has(q('#sentinel', container)), obs.length);
  intersect(false);
  $test.check('Does nothing while the sentinel is out of view', calls.length === 0, calls);
  intersect(true);
  $test.check('Calls onLoadMore when the sentinel enters the viewport', calls.length === 1, calls);
  rerender(<Probe onLoadMore={() => calls.push('b')} />);
  intersect(true);
  $test.check('Uses the latest onLoadMore callback', calls.join() === 'a,b' && observers().length === 1, calls);
  unmount();
  $test.check('Disconnects the observer on unmount', obs[0].disconnected === true);
}
