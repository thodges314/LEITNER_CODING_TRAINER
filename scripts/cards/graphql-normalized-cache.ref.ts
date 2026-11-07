interface CacheReference {
  __ref: string;
}

interface NormalizedRecord {
  [key: string]: unknown;
}

interface NormalizedCacheStore {
  write(data: Record<string, unknown>): void;
  read(rootKey: string): Record<string, unknown> | null;
  inspect(): Record<string, NormalizedRecord>;
}

function createNormalizedCache(): NormalizedCacheStore {
  const store: Record<string, NormalizedRecord> = {};

  function isEntity(val: unknown): val is { __typename: string; id: string | number; [key: string]: unknown } {
    return (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof (val as { __typename?: unknown }).__typename === 'string' &&
      (typeof (val as { id?: unknown }).id === 'string' || typeof (val as { id?: unknown }).id === 'number')
    );
  }

  function getEntityKey(val: { __typename: string; id: string | number }): string {
    return `${val.__typename}:${val.id}`;
  }

  function isRef(val: unknown): val is CacheReference {
    return (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof (val as { __ref?: unknown }).__ref === 'string' &&
      Object.keys(val).length === 1
    );
  }

  function normalizeValue(val: unknown): unknown {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(normalizeValue);
    }
    if (isEntity(val)) {
      const key = getEntityKey(val);
      const existing = store[key] || {};
      const record: NormalizedRecord = { ...existing };
      for (const [k, v] of Object.entries(val)) {
        record[k] = normalizeValue(v);
      }
      store[key] = record;
      return { __ref: key };
    }

    const embedded: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      embedded[k] = normalizeValue(v);
    }
    return embedded;
  }

  function write(data: Record<string, unknown>): void {
    if (!data || typeof data !== 'object') return;
    const rootQuery = (store['ROOT_QUERY'] || {}) as NormalizedRecord;
    const updatedRoot: NormalizedRecord = { ...rootQuery };
    for (const [k, v] of Object.entries(data)) {
      updatedRoot[k] = normalizeValue(v);
    }
    store['ROOT_QUERY'] = updatedRoot;
  }

  function denormalizeValue(val: unknown, seen = new Set<string>()): unknown {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      const arr: unknown[] = [];
      for (const item of val) {
        const resolved = denormalizeValue(item, seen);
        if (resolved === null && isRef(item)) return null;
        arr.push(resolved);
      }
      return arr;
    }
    if (isRef(val)) {
      const key = val.__ref;
      const record = store[key];
      if (!record) return null;
      if (seen.has(key)) {
        return { ...record };
      }
      const nextSeen = new Set(seen);
      nextSeen.add(key);
      const reconstructed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(record)) {
        const resolved = denormalizeValue(v, nextSeen);
        if (resolved === null && isRef(v)) return null;
        reconstructed[k] = resolved;
      }
      return reconstructed;
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      const resolved = denormalizeValue(v, seen);
      if (resolved === null && isRef(v)) return null;
      result[k] = resolved;
    }
    return result;
  }

  function read(rootKey: string): Record<string, unknown> | null {
    const rootQuery = store['ROOT_QUERY'] as NormalizedRecord | undefined;
    if (!rootQuery || !(rootKey in rootQuery)) {
      return null;
    }
    const result = denormalizeValue(rootQuery[rootKey]);
    return result as Record<string, unknown> | null;
  }

  function inspect(): Record<string, NormalizedRecord> {
    const copy: Record<string, NormalizedRecord> = {};
    for (const [k, v] of Object.entries(store)) {
      copy[k] = { ...v };
    }
    return copy;
  }

  return {
    write,
    read,
    inspect,
  };
}

