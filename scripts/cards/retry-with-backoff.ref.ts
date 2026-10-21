interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  factor?: number;
  signal?: AbortSignal;
}

async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, baseDelay = 20, factor = 2, signal }: RetryOptions = {}
): Promise<T> {
  const abortReason = (): any => signal?.reason ?? new DOMException('Aborted', 'AbortError');

  const wait = (ms: number): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) return reject(abortReason());
      const onAbort = (): void => {
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
      await wait(baseDelay * factor ** attempt);
    }
  }
}
