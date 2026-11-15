function createOfflineMutationQueue(options) {
  const {
    execute,
    storageKey = 'offline_mutations',
    storage = window.localStorage,
    onlineTarget = window,
  } = options;

  let seq = 1;
  let activeFlush = null;

  const readQueue = () => {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeQueue = (items) => {
    storage.setItem(storageKey, JSON.stringify(items));
  };

  const flush = () => {
    if (activeFlush) return activeFlush;

    activeFlush = (async () => {
      let succeeded = 0;
      let failed = 0;

      while (true) {
        const queue = readQueue();
        if (queue.length === 0) break;

        const next = queue[0];
        try {
          await execute(next);
          succeeded += 1;
          const latest = readQueue();
          writeQueue(latest.filter((item) => item.id !== next.id));
        } catch {
          failed = 1;
          break;
        }
      }

      const remaining = readQueue().length;
      return { succeeded, failed, remaining };
    })().finally(() => {
      activeFlush = null;
    });

    return activeFlush;
  };

  const handleOnline = () => {
    void flush();
  };

  onlineTarget.addEventListener('online', handleOnline);

  return {
    enqueue(type, payload) {
      const entry = {
        id: `mut-${Date.now()}-${seq++}`,
        type,
        payload,
        createdAt: Date.now(),
      };
      const queue = readQueue();
      queue.push(entry);
      writeQueue(queue);
      return entry;
    },
    flush,
    getPending() {
      return readQueue();
    },
    destroy() {
      onlineTarget.removeEventListener('online', handleOnline);
    },
  };
}

