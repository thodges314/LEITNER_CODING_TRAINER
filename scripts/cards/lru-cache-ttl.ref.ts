interface CacheTTLEntry<V> {
  value: V;
  expiry: number;
}

class LRUCacheTTL<K = unknown, V = unknown> {
  private capacity: number;
  private cache: Map<K, CacheTTLEntry<V>>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | -1 {
    if (!this.cache.has(key)) return -1;
    const entry = this.cache.get(key)!;
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return -1;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttl: number = 0): void {
    this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { value, expiry: ttl ? Date.now() + ttl : 0 });
  }
}
