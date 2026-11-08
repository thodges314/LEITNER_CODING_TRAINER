const createMicroBatcher = (options) => {
  let buffer = [];
  let timerId = null;
  let activeFlushPromise = Promise.resolve();

  const clearWaitTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const scheduleWaitTimer = () => {
    if (timerId === null) {
      timerId = setTimeout(() => {
        timerId = null;
        triggerFlush();
      }, options.maxWaitMs);
    }
  };

  const triggerFlush = () => {
    clearWaitTimer();
    const currentBatch = buffer;
    buffer = [];

    if (currentBatch.length === 0) {
      return activeFlushPromise;
    }

    const itemsToFlush = currentBatch.map((p) => p.item);

    const executeFlush = async () => {
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

  const add = (item) => {
    return new Promise((resolve, reject) => {
      buffer.push({ item, resolve, reject });

      if (buffer.length >= options.maxBatchSize) {
        triggerFlush();
      } else {
        scheduleWaitTimer();
      }
    });
  };

  const flush = () => {
    return triggerFlush();
  };

  const size = () => {
    return buffer.length;
  };

  const drain = async () => {
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

