interface MicrotaskBatcher<T, R> {
  schedule(item: T): Promise<R>;
  flush(): Promise<void>;
}

function createMicrotaskBatcher<T, R>(
  batchHandler: (items: T[]) => R[] | Promise<R[]>
): MicrotaskBatcher<T, R> {
  interface QueueEntry {
    item: T;
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
  }

  let queue: QueueEntry[] = [];
  let isScheduled = false;

  const flush = async (): Promise<void> => {
    if (queue.length === 0) return;
    const current = queue;
    queue = [];
    isScheduled = false;

    const items = current.map((entry) => entry.item);
    try {
      const results = await batchHandler(items);
      current.forEach((entry, idx) => {
        entry.resolve(results ? results[idx] : (undefined as unknown as R));
      });
    } catch (err) {
      current.forEach((entry) => {
        entry.reject(err);
      });
    }
  };

  const schedule = (item: T): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      queue.push({ item, resolve, reject });
      if (!isScheduled) {
        isScheduled = true;
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(flush);
        } else {
          Promise.resolve().then(flush);
        }
      }
    });
  };

  return {
    schedule,
    flush,
  };
}

