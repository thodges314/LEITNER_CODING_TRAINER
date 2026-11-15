interface ChunkOptions {
  budgetMs?: number;
  yieldToMain?: () => Promise<void>;
  now?: () => number;
  signal?: AbortSignal;
}

async function processInChunks<T, R>(
  items: T[],
  worker: (item: T, index: number) => R,
  options: ChunkOptions = {}
): Promise<R[]> {
  const {
    budgetMs = 16,
    now = () => performance.now(),
    signal,
    yieldToMain = () => {
      const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
      if (typeof sched?.yield === 'function') {
        return sched.yield();
      }
      return new Promise<void>((resolve) => setTimeout(resolve, 0));
    },
  } = options;

  const checkAborted = (): void => {
    if (signal?.aborted) {
      throw signal.reason ?? new Error('Aborted');
    }
  };

  checkAborted();

  const results: R[] = [];
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

