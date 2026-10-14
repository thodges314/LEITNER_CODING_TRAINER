const { render, qa, observers, intersect } = $dom;
{
  const calls = [];
  const load = () => calls.push(1);
  const ui = (props) => <InfiniteList items={['a', 'b']} hasMore loading={false} onLoadMore={load} {...props} />;
  const { container, rerender, unmount } = render(ui({}));
  const texts = qa('li:not([data-sentinel])', container).map((li) => li.textContent);
  $test.check('Renders the items', texts.join() === 'a,b', texts);
  intersect(true);
  $test.check('Loads the next page when the sentinel becomes visible', calls.length === 1, calls.length);
  rerender(ui({ loading: true }));
  intersect(true);
  $test.check('Does not load again while a page is loading', calls.length === 1, calls.length);
  rerender(ui({ loading: false, hasMore: false }));
  intersect(true);
  $test.check('Stops loading and disconnects at the last page', calls.length === 1 && observers().every((o) => o.disconnected), { calls: calls.length });
  unmount();
}
{
  const { unmount } = render(<InfiniteList items={['a']} hasMore loading={false} onLoadMore={() => {}} />);
  const obs = observers();
  unmount();
  $test.check('Disconnects the observer on unmount', obs.length > 0 && obs.every((o) => o.disconnected));
}
