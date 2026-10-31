class DataLoader {
  constructor(batchFn) {
    this._batchFn = batchFn;
    this._cache = new Map();
    this._queue = [];
  }

  load(key) {
    if (this._cache.has(key)) return this._cache.get(key);
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    this._cache.set(key, promise);
    this._queue.push({ key, resolve, reject });

    if (this._queue.length === 1) {
      queueMicrotask(async () => {
        const queue = this._queue;
        this._queue = [];
        try {
          const keys = queue.map((q) => q.key);
          const results = await this._batchFn(keys);
          if (!Array.isArray(results) || results.length !== keys.length) {
            throw new Error('Batch function must return an array of the same length as keys');
          }
          queue.forEach((q, i) => results[i] instanceof Error ? q.reject(results[i]) : q.resolve(results[i]));
        } catch (err) {
          queue.forEach((q) => q.reject(err));
        }
      });
    }
    return promise;
  }

  loadMany(keys) {
    return Promise.all(keys.map((k) => this.load(k).catch((err) => (err instanceof Error ? err : new Error(String(err))))));
  }

  clear(key) { this._cache.delete(key); return this; }
  clearAll() { this._cache.clear(); return this; }
}
