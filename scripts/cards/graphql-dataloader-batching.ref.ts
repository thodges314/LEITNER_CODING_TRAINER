type BatchFunction<K, V> = (keys: readonly K[]) => Promise<Array<V | Error>>;

interface IDataLoader<K, V> {
  load(key: K): Promise<V>;
  loadMany(keys: K[]): Promise<Array<V | Error>>;
  clear(key: K): this;
  clearAll(): this;
}

interface QueueItem<K, V> {
  key: K;
  resolve: (value: V) => void;
  reject: (reason: any) => void;
}

class DataLoader<K, V> implements IDataLoader<K, V> {
  private _batchFn: BatchFunction<K, V>;
  private _cache: Map<K, Promise<V>>;
  private _queue: QueueItem<K, V>[];

  constructor(batchFn: BatchFunction<K, V>) {
    if (typeof batchFn !== 'function') {
      throw new TypeError('DataLoader must be constructed with a function');
    }
    this._batchFn = batchFn;
    this._cache = new Map<K, Promise<V>>();
    this._queue = [];
  }

  load(key: K): Promise<V> {
    if (this._cache.has(key)) {
      return this._cache.get(key)!;
    }

    let resolvePromise!: (value: V) => void;
    let rejectPromise!: (reason: any) => void;
    const promise = new Promise<V>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    this._cache.set(key, promise);
    this._queue.push({ key, resolve: resolvePromise, reject: rejectPromise });

    if (this._queue.length === 1) {
      queueMicrotask(() => {
        this._dispatch().catch(() => {});
      });
    }

    return promise;
  }

  private async _dispatch(): Promise<void> {
    const queue = this._queue;
    this._queue = [];
    if (queue.length === 0) return;

    const keys = queue.map((item) => item.key);
    try {
      const batchPromise = this._batchFn(keys);
      if (batchPromise && typeof batchPromise.catch === 'function') {
        batchPromise.catch(() => {});
      }
      const results = await batchPromise;
      if (!Array.isArray(results) || results.length !== keys.length) {
        throw new Error('Batch function must return an array of the same length as keys');
      }

      queue.forEach((item, index) => {
        const val = results[index];
        if (val instanceof Error) {
          item.reject(val);
        } else {
          item.resolve(val);
        }
      });
    } catch (err) {
      queue.forEach((item) => item.reject(err));
    }
  }

  loadMany(keys: K[]): Promise<Array<V | Error>> {
    if (!Array.isArray(keys)) {
      throw new TypeError('loadMany expects an array of keys');
    }
    return Promise.all(
      keys.map((k) =>
        this.load(k).catch((err) => (err instanceof Error ? err : new Error(String(err))))
      )
    );
  }

  clear(key: K): this {
    this._cache.delete(key);
    return this;
  }

  clearAll(): this {
    this._cache.clear();
    return this;
  }
}
