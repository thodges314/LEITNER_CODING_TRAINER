const { render, fire, q, qa, act, wait } = $dom;
const makeApi = () => {
  const calls = [];
  const fetchPage = (page) => new Promise((resolve, reject) => calls.push({ page, resolve, reject }));
  return { calls, fetchPage };
};
const lis = (c) => qa('li', c).map((li) => li.textContent).join();
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const settle = (fn) => act(async () => { fn(); });
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await wait(30); // state set from an effect renders on the next tick in production builds
  $test.check('Initial mount loading state', api.calls.length === 1 && api.calls[0].page === 1 && q('[role="status"]', r.container) !== null && btn(r.container, 'Load more') === undefined, { calls: api.calls.length });
  await settle(() => api.calls[0].resolve({ items: ['a'], hasMore: false }));
  r.unmount();
}
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await settle(() => api.calls[0].resolve({ items: ['a', 'b'], hasMore: true }));
  $test.check("Render items and 'Load more' button", lis(r.container) === 'a,b' && btn(r.container, 'Load more') !== undefined && q('[role="status"]', r.container) === null, { items: lis(r.container) });
  r.unmount();
}
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await settle(() => api.calls[0].resolve({ items: ['a', 'b'], hasMore: true }));
  fire.click(btn(r.container, 'Load more'));
  const requested = api.calls.map((c) => c.page).join();
  await settle(() => api.calls[1].resolve({ items: ['c'], hasMore: true }));
  $test.check('Append next page on click', requested === '1,2' && lis(r.container) === 'a,b,c', { requested, items: lis(r.container) });
  r.unmount();
}
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await settle(() => api.calls[0].resolve({ items: ['a'], hasMore: true }));
  fire.click(btn(r.container, 'Load more'));
  await settle(() => api.calls[1].resolve({ items: ['b'], hasMore: false }));
  $test.check('Hide button on final page', btn(r.container, 'Load more') === undefined && lis(r.container) === 'a,b', { items: lis(r.container) });
  r.unmount();
}
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await settle(() => api.calls[0].resolve({ items: ['a'], hasMore: true }));
  fire.click(btn(r.container, 'Load more'));
  await settle(() => api.calls[1].reject(new Error('network')));
  const alertShown = q('[role="alert"]', r.container) !== null && lis(r.container) === 'a';
  fire.click(btn(r.container, 'Retry'));
  const retried = api.calls.map((c) => c.page).join();
  await settle(() => api.calls[2].resolve({ items: ['b'], hasMore: false }));
  $test.check('Error alert and Retry', alertShown && retried === '1,2,2' && lis(r.container) === 'a,b' && q('[role="alert"]', r.container) === null, { alertShown, retried, items: lis(r.container) });
  r.unmount();
}
{
  const api = makeApi();
  const r = render(<LoadMoreList fetchPage={api.fetchPage} />);
  await settle(() => api.calls[0].resolve({ items: ['a'], hasMore: true }));
  const button = btn(r.container, 'Load more');
  fire.click(button);
  fire.click(button);
  fire.click(button);
  $test.check('Ignore clicks while loading', api.calls.length === 2, api.calls.length);
  await settle(() => api.calls[1].resolve({ items: ['b'], hasMore: false }));
  r.unmount();
}
