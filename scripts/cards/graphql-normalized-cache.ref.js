function createNormalizedCache() {
  const store = {};

  function isEntity(val) {
    return (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof val.__typename === 'string' &&
      (typeof val.id === 'string' || typeof val.id === 'number')
    );
  }

  function getEntityKey(val) {
    return `${val.__typename}:${val.id}`;
  }

  function isRef(val) {
    return (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof val.__ref === 'string' &&
      Object.keys(val).length === 1
    );
  }

  function normalizeValue(val) {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(normalizeValue);
    }
    if (isEntity(val)) {
      const key = getEntityKey(val);
      const existing = store[key] || {};
      const record = { ...existing };
      for (const [k, v] of Object.entries(val)) {
        record[k] = normalizeValue(v);
      }
      store[key] = record;
      return { __ref: key };
    }

    const embedded = {};
    for (const [k, v] of Object.entries(val)) {
      embedded[k] = normalizeValue(v);
    }
    return embedded;
  }

  function write(data) {
    if (!data || typeof data !== 'object') return;
    const rootQuery = store['ROOT_QUERY'] || {};
    const updatedRoot = { ...rootQuery };
    for (const [k, v] of Object.entries(data)) {
      updatedRoot[k] = normalizeValue(v);
    }
    store['ROOT_QUERY'] = updatedRoot;
  }

  function denormalizeValue(val, seen = new Set()) {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      const arr = [];
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
      const reconstructed = {};
      for (const [k, v] of Object.entries(record)) {
        const resolved = denormalizeValue(v, nextSeen);
        if (resolved === null && isRef(v)) return null;
        reconstructed[k] = resolved;
      }
      return reconstructed;
    }
    const result = {};
    for (const [k, v] of Object.entries(val)) {
      const resolved = denormalizeValue(v, seen);
      if (resolved === null && isRef(v)) return null;
      result[k] = resolved;
    }
    return result;
  }

  function read(rootKey) {
    const rootQuery = store['ROOT_QUERY'];
    if (!rootQuery || !(rootKey in rootQuery)) {
      return null;
    }
    return denormalizeValue(rootQuery[rootKey]);
  }

  function inspect() {
    const copy = {};
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

