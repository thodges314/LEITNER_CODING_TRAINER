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
  $test.check('Resolves with data on 200', h.result.current.loading === false && h.result.current.data && h.result.current.data.id === 1 && h.result.current.error === null, h.result.current);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/missing' } });
  await answer(calls[0], 404, {});
  const { data, loading, error } = h.result.current;
  $test.check('Reports an Error on a 404', loading === false && data === null && error instanceof Error && /404/.test(error.message), h.result.current);
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.rerender({ url: '/api/b' });
  const aborted = calls[0].signal.aborted === true;
  await answer(calls[1], 200, { id: 2 });
  $test.check('Changing url aborts the previous request and shows the new data', aborted && calls.length === 2 && h.result.current.data && h.result.current.data.id === 2, { aborted, calls: calls.length, state: h.result.current });
  h.unmount();
}
{
  calls.length = 0;
  const h = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/a' } });
  h.unmount();
  $test.check('Unmounting aborts the in-flight request', calls[0].signal.aborted === true);
}
