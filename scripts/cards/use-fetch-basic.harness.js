const { renderHook, act } = $dom;
const calls = [];
// Controllable fetch: the test answers (or fails) each request.
fetch = (url) =>
  new Promise((resolve, reject) => {
    calls.push({
      url,
      respond: (status, body) => resolve({ ok: status >= 200 && status < 300, status, json: async () => body }),
      fail: (err) => reject(err),
    });
  });
const answer = (call, status, body) => act(async () => { call.respond(status, body); });

{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  const s = h.result.current;
  $test.check('Initial render shows loading and fetches the url once', s.loading === true && s.data === null && s.error === null && calls.length === 1 && calls[0].url === '/api/a', { state: s, fetchCalls: calls.length });
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  await answer(calls[0], 200, { id: 1 });
  const s = h.result.current;
  $test.check('Resolves with data on 200', s.loading === false && s.error === null && s.data && s.data.id === 1, s);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  await answer(calls[0], 404, {});
  const s = h.result.current;
  $test.check('A non-2xx status gives an Error that mentions the status', s.loading === false && s.data === null && s.error instanceof Error && /404/.test(s.error.message), s);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  await act(async () => { calls[0].fail(new Error('offline')); });
  const s = h.result.current;
  $test.check('A network failure gives that Error', s.loading === false && s.data === null && s.error instanceof Error && s.error.message === 'offline', s);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  await answer(calls[0], 200, { id: 1 });
  h.rerender({ url: '/api/b' });
  await act(async () => {});
  const during = h.result.current;
  const fetchedB = calls.length === 2 && calls[1].url === '/api/b';
  await answer(calls[1], 200, { id: 2 });
  const after = h.result.current;
  $test.check('Changing the url fetches again and shows loading while it runs', fetchedB && during.loading === true && during.data === null && after.loading === false && after.data && after.data.id === 2, { during, after, fetchCalls: calls.length });
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.rerender({ url: '/api/a' });
  await act(async () => {});
  $test.check('Re-rendering with the same url does not fetch again', calls.length === 1, calls.length);
  h.unmount();
}
