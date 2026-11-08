import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEYS,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeGetJson,
  safeSetJson,
} from './storage';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

describe('storage utilities', () => {
  it('reads, writes, and removes items cleanly', () => {
    const store = createMemoryStorage();
    expect(safeGetItem(STORAGE_KEYS.THEME, store)).toBeNull();
    expect(safeSetItem(STORAGE_KEYS.THEME, 'dark', store)).toBe(true);
    expect(safeGetItem(STORAGE_KEYS.THEME, store)).toBe('dark');
    safeRemoveItem(STORAGE_KEYS.THEME, store);
    expect(safeGetItem(STORAGE_KEYS.THEME, store)).toBeNull();
  });

  it('serializes and parses JSON with fallback on malformed input', () => {
    const store = createMemoryStorage();
    expect(safeGetJson('missing', [1, 2], store)).toEqual([1, 2]);
    expect(safeSetJson('items', { count: 3 }, store)).toBe(true);
    expect(safeGetJson('items', { count: 0 }, store)).toEqual({ count: 3 });

    store.setItem('corrupt', '{not-json');
    expect(safeGetJson('corrupt', { ok: false }, store)).toEqual({ ok: false });
  });

  it('never throws when storage throws QuotaExceededError or is null', () => {
    const throwingStore = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(safeGetItem('k', throwingStore)).toBeNull();
    expect(safeSetItem('k', 'v', throwingStore)).toBe(false);
    expect(() => safeRemoveItem('k', throwingStore)).not.toThrow();
    expect(safeGetItem('k', null)).toBeNull();
    expect(safeSetItem('k', 'v', null)).toBe(false);
  });
});

