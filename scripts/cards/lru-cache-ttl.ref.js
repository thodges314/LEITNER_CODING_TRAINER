class LRUCacheTTL {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const entry = this.cache.get(key);
    if (entry.expiry && Date.now() > entry.expiry) { this.cache.delete(key); return -1; }
    this.cache.delete(key); this.cache.set(key, entry);
    return entry.value;
  }
  set(key, value, ttl = 0) {
    this.cache.delete(key);
    if (this.cache.size >= this.capacity) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { value, expiry: ttl ? Date.now() + ttl : 0 });
  }
}
