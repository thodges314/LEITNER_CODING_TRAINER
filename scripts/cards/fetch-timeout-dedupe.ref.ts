const inFlight = new Map<string, Promise<any>>();

function dedupeFetch<T>(key: string, fn: (signal: AbortSignal) => Promise<T>, timeoutMs: number = 5000): Promise<T> {
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const controller = new AbortController();
  let timer: any;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const promise = Promise.race([fn(controller.signal), timeout]).finally(() => {
    clearTimeout(timer);
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
