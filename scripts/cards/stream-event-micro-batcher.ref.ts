interface MicroBatcherOptions<T> {
  maxBatchSize: number;
  maxWaitMs: number;
  flushHandler: (batch: T[]) => Promise<void> | void;
}

interface MicroBatcher<T> {
  add(item: T): Promise<void>;
  flush(): Promise<void>;
  size(): number;
  drain(): Promise<void>;
}

interface PendingItem<T> {
  item: T;
  resolve: () => void;
  reject: (err: unknown) => void;
}

const createMicroBatcher = <T>(options: MicroBatcherOptions<T>): MicroBatcher<T> => {
  let buffer: PendingItem<T>[] = [];
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let activeFlushPromise: Promise<void> = Promise.resolve();

  const clearWaitTimer = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const scheduleWaitTimer = (): void => {
    if (timerId === null) {
      timerId = setTimeout(() => {
        timerId = null;
        triggerFlush();
      }, options.maxWaitMs);
    }
  };

  const triggerFlush = (): Promise<void> => {
    clearWaitTimer();
    const currentBatch = buffer;
    buffer = [];

    if (currentBatch.length === 0) {
      return activeFlushPromise;
    }

    const itemsToFlush = currentBatch.map((p) => p.item);

    const executeFlush = async (): Promise<void> => {
      try {
        await options.flushHandler(itemsToFlush);
        for (const p of currentBatch) {
          p.resolve();
        }
      } catch (err) {
        for (const p of currentBatch) {
          p.reject(err);
        }
      }
    };

    activeFlushPromise = activeFlushPromise.then(executeFlush, executeFlush);
    return activeFlushPromise;
  };

  const add = (item: T): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      buffer.push({ item, resolve, reject });

      if (buffer.length >= options.maxBatchSize) {
        triggerFlush();
      } else {
        scheduleWaitTimer();
      }
    });
  };

  const flush = (): Promise<void> => {
    return triggerFlush();
  };

  const size = (): number => {
    return buffer.length;
  };

  const drain = async (): Promise<void> => {
    await triggerFlush();
    await activeFlushPromise;
  };

  return {
    add,
    flush,
    size,
    drain,
  };
};

