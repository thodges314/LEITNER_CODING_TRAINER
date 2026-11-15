function openDatabase(options) {
  const {
    name,
    version = 1,
    stores,
    keyPath,
    indexedDb = window.indexedDB,
  } = options;

  const promisifyRequest = (request) =>
    new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
    });

  return new Promise((resolve, reject) => {
    const openReq = indexedDb.open(name, version);

    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      for (const storeName of stores) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, keyPath ? { keyPath } : undefined);
        }
      }
    };

    openReq.onerror = () => {
      reject(openReq.error ?? new Error('Failed to open IndexedDB'));
    };

    openReq.onblocked = () => {
      reject(new Error('IndexedDB open blocked'));
    };

    openReq.onsuccess = () => {
      const db = openReq.result;

      resolve({
        get(storeName, key) {
          const tx = db.transaction(storeName, 'readonly');
          return promisifyRequest(tx.objectStore(storeName).get(key));
        },
        put(storeName, value, key) {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = key !== undefined ? store.put(value, key) : store.put(value);
          return promisifyRequest(req);
        },
        async delete(storeName, key) {
          const tx = db.transaction(storeName, 'readwrite');
          await promisifyRequest(tx.objectStore(storeName).delete(key));
        },
        async getAll(storeName) {
          const tx = db.transaction(storeName, 'readonly');
          const result = await promisifyRequest(tx.objectStore(storeName).getAll());
          return result ?? [];
        },
        close() {
          db.close();
        },
      });
    };
  });
}

