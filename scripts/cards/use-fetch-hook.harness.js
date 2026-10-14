const { renderHook, act } = $dom;
const calls = [];
// Controllable fetch: each call can be answered (or failed) by the test, and honors abort.
fetch = (url, init) =>
  new Promise((resolve, reject) => {
    const signal = init && init.signal;
    calls.push({
      url,
      signal,
      respond: (status, body) => resolve({ ok: status >= 200 && status < 300, status, json: async () => body }),
      fail: (err) => reject(err),
    });
    if (signal) signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
const answer = (call, status, body) => act(async () => { call.respond(status, body); });

{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  $test.check('Initial render shows loading', h.result.current.loading === true && h.result.current.data === null && h.result.current.error === null, h.result.current);
  await answer(calls[0], 200, { id: 1 });
  $test.check('Resolves with data on 200', h.result.current.loading === false && h.result.current.data && h.result.current.data.id === 1, h.result.current);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  await act(async () => { calls[0].fail(new Error('offline')); });
  const { data, loading, error } = h.result.current;
  $test.check('Reports an Error on a failed request', loading === false && data === null && error instanceof Error && error.message === 'offline', h.result.current);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.rerender({ url: '/api/b' });
  $test.check('Changing url aborts the previous request', calls[0].signal.aborted === true && calls[1].signal.aborted === false);
  h.unmount();
}
{
  // A server that ignores the abort signal and answers late.
  const pending = [];
  fetch = (url) => new Promise((resolve) => pending.push((body) => resolve({ ok: true, status: 200, json: async () => body })));
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.rerender({ url: '/api/b' });
  await act(async () => { pending[1]({ id: 'b' }); });
  await act(async () => { pending[0]({ id: 'a' }); });
  $test.check('A stale response never overwrites newer data', h.result.current.data && h.result.current.data.id === 'b', h.result.current);
  h.unmount();
}
{
  calls.length = 0;
  fetch = (url, init) => new Promise((resolve, reject) => {
    calls.push({ signal: init && init.signal });
    if (init && init.signal) init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.unmount();
  $test.check('Unmounting aborts the in-flight request', calls[0].signal.aborted === true);
}
