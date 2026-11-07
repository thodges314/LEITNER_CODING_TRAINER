interface CacheItem<T = any> {
  data: T;
  tags: string[];
  expiresAt?: number;
}

interface TagCacheOptions {
  tags?: string[];
  ttlMs?: number;
}

interface TagCacheManager {
  set<T = any>(key: string, data: T, options?: TagCacheOptions): void;
  get<T = any>(key: string): T | null;
  has(key: string): boolean;
  revalidateTag(tag: string): number;
  clear(): void;
}

const createTagCacheManager = (): TagCacheManager => {
  const store = new Map<string, CacheItem>();
  const tagToKeys = new Map<string, Set<string>>();

  const removeKey = (key: string): void => {
    const item = store.get(key);
    if (!item) return;

    store.delete(key);
    for (const tag of item.tags) {
      const keys = tagToKeys.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) tagToKeys.delete(tag);
      }
    }
  };

  const set = <T = any>(key: string, data: T, options?: TagCacheOptions): void => {
    removeKey(key);

    const tags = Array.isArray(options?.tags)
      ? options.tags.filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim())
      : [];
    const ttl = typeof options?.ttlMs === 'number' && options.ttlMs > 0 ? options.ttlMs : undefined;
    const expiresAt = ttl !== undefined ? Date.now() + ttl : undefined;

    store.set(key, { data, tags, expiresAt });

    for (const tag of tags) {
      let keys = tagToKeys.get(tag);
      if (!keys) {
        keys = new Set<string>();
        tagToKeys.set(tag, keys);
      }
      keys.add(key);
    }
  };

  const get = <T = any>(key: string): T | null => {
    const item = store.get(key);
    if (!item) return null;

    if (item.expiresAt !== undefined && Date.now() >= item.expiresAt) {
      removeKey(key);
      return null;
    }

    return item.data as T;
  };

  const has = (key: string): boolean => {
    return get(key) !== null;
  };

  const revalidateTag = (tag: string): number => {
    const normalizedTag = typeof tag === 'string' ? tag.trim() : '';
    const keys = tagToKeys.get(normalizedTag);
    if (!keys || keys.size === 0) return 0;

    const keysToPurge = Array.from(keys);
    for (const key of keysToPurge) {
      removeKey(key);
    }

    return keysToPurge.length;
  };

  const clear = (): void => {
    store.clear();
    tagToKeys.clear();
  };

  return {
    set,
    get,
    has,
    revalidateTag,
    clear,
  };
};
