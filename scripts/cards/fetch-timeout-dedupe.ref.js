const inFlight = new Map();

function dedupeFetch(key, fn, timeoutMs = 5000) {
  if (inFlight.has(key)) return inFlight.get(key);

  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
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
