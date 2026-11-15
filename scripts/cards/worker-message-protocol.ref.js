function createWorkerClient(worker) {
  let nextId = 1;
  let disposed = false;
  const pending = new Map();

  const settleAll = (err) => {
    for (const entry of pending.values()) {
      if (entry.timer !== null) clearTimeout(entry.timer);
      entry.reject(err);
    }
    pending.clear();
  };

  const handleMessage = (event) => {
    const data = event?.data;
    if (!data || typeof data.id !== 'string') return;
    const entry = pending.get(data.id);
    if (!entry) return;

    pending.delete(data.id);
    if (entry.timer !== null) clearTimeout(entry.timer);

    if (data.ok) {
      entry.resolve(data.result);
    } else {
      entry.reject(new Error(data.error ?? 'Worker error'));
    }
  };

  const handleError = (event) => {
    settleAll(new Error(event?.message || 'Worker error'));
  };

  worker.addEventListener('message', handleMessage);
  worker.addEventListener('error', handleError);

  return {
    request(type, payload, options = {}) {
      if (disposed) {
        return Promise.reject(new Error('Worker client disposed'));
      }

      const id = `req-${nextId++}`;
      return new Promise((resolve, reject) => {
        let timer = null;
        if (typeof options.timeoutMs === 'number' && Number.isFinite(options.timeoutMs) && options.timeoutMs > 0) {
          timer = setTimeout(() => {
            if (!pending.has(id)) return;
            pending.delete(id);
            reject(new Error('Worker request timed out'));
          }, options.timeoutMs);
        }

        pending.set(id, { resolve, reject, timer });

        if (options.transfer) {
          worker.postMessage({ id, type, payload }, options.transfer);
        } else {
          worker.postMessage({ id, type, payload });
        }
      });
    },
    pendingCount() {
      return pending.size;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      settleAll(new Error('Worker client disposed'));
    },
  };
}

