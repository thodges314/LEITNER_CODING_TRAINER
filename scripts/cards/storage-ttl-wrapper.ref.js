function createStorage(backend, { prefix = 'app:', now = Date.now } = {}) {
  const full = (key) => prefix + key;

  return {
    set(key, value, { ttlMs } = {}) {
      const entry = { v: value, e: ttlMs ? now() + ttlMs : null };
      try {
        backend.setItem(full(key), JSON.stringify(entry));
        return true;
      } catch {
        return false; // quota exceeded, storage disabled, ...
      }
    },
    get(key, fallback = null) {
      const raw = backend.getItem(full(key));
      if (raw === null) return fallback;
      try {
        const entry = JSON.parse(raw);
        if (entry.e !== null && now() >= entry.e) {
          backend.removeItem(full(key));
          return fallback;
        }
        return entry.v;
      } catch {
        backend.removeItem(full(key)); // corrupt value
        return fallback;
      }
    },
    remove(key) {
      backend.removeItem(full(key));
    },
    keys() {
      const out = [];
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
      }
      return out;
    },
    clear() {
      this.keys().forEach((k) => backend.removeItem(full(k)));
    },
  };
}
