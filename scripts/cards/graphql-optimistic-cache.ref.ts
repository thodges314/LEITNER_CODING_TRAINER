interface MutateOptions<T extends Record<string, any> = Record<string, any>> {
  optimisticResponse: Partial<T>;
  mutationPromise: Promise<T>;
}

interface OptimisticStore {
  get(key: string): any;
  getAll(): Record<string, any>;
  mutate<T extends Record<string, any>>(options: MutateOptions<T>): Promise<T>;
}

function createOptimisticStore(initialStore: Record<string, any> = {}): OptimisticStore {
  const store: Record<string, any> = {};
  for (const [k, v] of Object.entries(initialStore)) {
    store[k] = v !== null && typeof v === 'object' ? { ...v } : v;
  }

  function get(key: string): any {
    return store[key];
  }

  function getAll(): Record<string, any> {
    const copy: Record<string, any> = {};
    for (const [k, v] of Object.entries(store)) {
      copy[k] = v !== null && typeof v === 'object' ? { ...v } : v;
    }
    return copy;
  }

  async function mutate<T extends Record<string, any>>(options: MutateOptions<T>): Promise<T> {
    const { optimisticResponse, mutationPromise } = options;

    const checkpoint = new Map<string, any>();
    for (const key of Object.keys(optimisticResponse || {})) {
      if (key in store) {
        const val = store[key];
        checkpoint.set(key, val !== null && typeof val === 'object' ? { ...val } : val);
      } else {
        checkpoint.set(key, undefined);
      }
    }

    for (const [key, patch] of Object.entries(optimisticResponse || {})) {
      const current = store[key];
      if (current !== null && typeof current === 'object' && patch !== null && typeof patch === 'object') {
        store[key] = { ...current, ...patch };
      } else {
        store[key] = patch;
      }
    }

    try {
      const serverData = await mutationPromise;

      if (serverData && typeof serverData === 'object') {
        for (const [key, record] of Object.entries(serverData)) {
          const current = store[key];
          if (current !== null && typeof current === 'object' && record !== null && typeof record === 'object') {
            store[key] = { ...current, ...record };
          } else {
            store[key] = record;
          }
        }
      }

      return serverData;
    } catch (err) {
      for (const [key, previousVal] of checkpoint.entries()) {
        if (previousVal === undefined) {
          delete store[key];
        } else {
          store[key] = previousVal;
        }
      }
      throw err;
    }
  }

  return {
    get,
    getAll,
    mutate,
  };
}

