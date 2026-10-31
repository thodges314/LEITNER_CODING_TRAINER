type BatchFunction<K, V> = (keys: readonly K[]) => Promise<Array<V | Error>>;

interface QueueItem<K, V> {
  key: K;
  resolve: (value: V) => void;
  reject: (reason: any) => void;
}

class DataLoader<K, V> implements IDataLoader<K, V> {
  private _batchFn: BatchFunction<K, V>;
  private _cache = new Map<K, Promise<V>>();
  private _queue: QueueItem<K, V>[] = [];

  constructor(batchFn: BatchFunction<K, V>) {
    this._batchFn = batchFn;
  }

  load(key: K): Promise<V> {
    if (this._cache.has(key)) return this._cache.get(key)!;
    let resolve!: (value: V) => void;
    let reject!: (reason: any) => void;
    const promise = new Promise<V>((res, rej) => { resolve = res; reject = rej; });
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

  loadMany(keys: K[]): Promise<Array<V | Error>> {
    return Promise.all(keys.map((k) => this.load(k).catch((err) => (err instanceof Error ? err : new Error(String(err))))));
  }

  clear(key: K): this { this._cache.delete(key); return this; }
  clearAll(): this { this._cache.clear(); return this; }
}

