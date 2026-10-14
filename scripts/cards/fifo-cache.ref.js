class FifoCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // a Map iterates in insertion order
  }

  get size() {
    return this.map.size;
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value) {
    if (!this.map.has(key) && this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
}
