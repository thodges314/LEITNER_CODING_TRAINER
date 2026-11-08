function createMicrotaskBatcher(batchHandler) {
  let queue = [];
  let isScheduled = false;

  const flush = async () => {
    if (queue.length === 0) return;
    const current = queue;
    queue = [];
    isScheduled = false;

    const items = current.map((entry) => entry.item);
    try {
      const results = await batchHandler(items);
      current.forEach((entry, idx) => {
        entry.resolve(results ? results[idx] : undefined);
      });
    } catch (err) {
      current.forEach((entry) => {
        entry.reject(err);
      });
    }
  };

  const schedule = (item) => {
    return new Promise((resolve, reject) => {
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

