interface StorageGetter {
  getItem(key: string): string | null;
}

interface StorageSetter {
  setItem(key: string, value: string): void;
}

function safeParse<T = unknown>(text: unknown, fallback: T): T {
  if (typeof text !== 'string') return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function safeGet<T = unknown>(storage: StorageGetter, key: string, fallback: T): T {
  return safeParse<T>(storage.getItem(key), fallback);
}

function safeSet(storage: StorageSetter, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
