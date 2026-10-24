interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  length: number;
}

interface StorageOptions {
  prefix?: string;
  now?: () => number;
}

interface StorageEntry<T> {
  v: T;
  e: number | null;
}

interface StorageWrapper {
  set(key: string, value: unknown, options?: { ttlMs?: number }): boolean;
  get<T = unknown>(key: string, fallback?: T): T | null;
  remove(key: string): void;
  keys(): string[];
  clear(): void;
}

function createStorage(
  backend: StorageBackend,
  { prefix = 'app:', now = Date.now }: StorageOptions = {}
): StorageWrapper {
  const full = (key: string): string => prefix + key;

  return {
    set(key: string, value: unknown, { ttlMs }: { ttlMs?: number } = {}): boolean {
      const entry: StorageEntry<unknown> = { v: value, e: ttlMs ? now() + ttlMs : null };
      try {
        backend.setItem(full(key), JSON.stringify(entry));
        return true;
      } catch {
        return false; // quota exceeded, storage disabled, ...
      }
    },
    get<T = unknown>(key: string, fallback: T | null = null): T | null {
      const raw = backend.getItem(full(key));
      if (raw === null) return fallback;
      try {
        const entry = JSON.parse(raw) as StorageEntry<T>;
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
    remove(key: string): void {
      backend.removeItem(full(key));
    },
    keys(): string[] {
      const out: string[] = [];
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
      }
      return out;
    },
    clear(): void {
      this.keys().forEach((k) => backend.removeItem(full(k)));
    },
  };
}
