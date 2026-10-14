async function retry(fn, { retries = 3, baseDelay = 20, factor = 2, signal } = {}) {
  const abortReason = () => signal.reason ?? new DOMException('Aborted', 'AbortError');

  // A delay that ends immediately (rejecting with the abort reason) when the signal fires.
  const wait = (ms) =>
    new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortReason());
      const onAbort = () => {
        clearTimeout(timer);
        reject(abortReason());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      signal?.addEventListener('abort', onAbort, { once: true });
    });

  for (let attempt = 0; ; attempt++) {
    if (signal?.aborted) throw abortReason();
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      await wait(baseDelay * factor ** attempt); // baseDelay, baseDelay*factor, baseDelay*factor^2, ...
    }
  }
}
