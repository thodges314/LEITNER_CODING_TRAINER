async function processInChunks(items, worker, options = {}) {
  const {
    budgetMs = 16,
    now = () => performance.now(),
    signal,
    yieldToMain = () => {
      if (typeof globalThis.scheduler?.yield === 'function') {
        return globalThis.scheduler.yield();
      }
      return new Promise((resolve) => setTimeout(resolve, 0));
    },
  } = options;

  const checkAborted = () => {
    if (signal?.aborted) {
      throw signal.reason ?? new Error('Aborted');
    }
  };

  checkAborted();

  const results = [];
  let sliceStart = now();

  for (let i = 0; i < items.length; i += 1) {
    results.push(worker(items[i], i));
    if (i < items.length - 1 && now() - sliceStart >= budgetMs) {
      await yieldToMain();
      checkAborted();
      sliceStart = now();
    }
  }

  return results;
}

