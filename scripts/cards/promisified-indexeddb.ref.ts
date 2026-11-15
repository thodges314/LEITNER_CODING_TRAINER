interface OpenDbOptions {
  name: string;
  version?: number;
  stores: string[];
  keyPath?: string;
  indexedDb?: IDBFactory;
}

interface PromisifiedDb {
  get<T = unknown>(storeName: string, key: IDBValidKey): Promise<T | undefined>;
  put<T = unknown>(storeName: string, value: T, key?: IDBValidKey): Promise<IDBValidKey>;
  delete(storeName: string, key: IDBValidKey): Promise<void>;
  getAll<T = unknown>(storeName: string): Promise<T[]>;
  close(): void;
}

function openDatabase(options: OpenDbOptions): Promise<PromisifiedDb> {
  const {
    name,
    version = 1,
    stores,
    keyPath,
    indexedDb = window.indexedDB,
  } = options;

  const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
    });

  return new Promise<PromisifiedDb>((resolve, reject) => {
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
        get<T = unknown>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
          const tx = db.transaction(storeName, 'readonly');
          return promisifyRequest<T | undefined>(tx.objectStore(storeName).get(key));
        },
        put<T = unknown>(storeName: string, value: T, key?: IDBValidKey): Promise<IDBValidKey> {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = key !== undefined ? store.put(value, key) : store.put(value);
          return promisifyRequest<IDBValidKey>(req);
        },
        async delete(storeName: string, key: IDBValidKey): Promise<void> {
          const tx = db.transaction(storeName, 'readwrite');
          await promisifyRequest(tx.objectStore(storeName).delete(key));
        },
        async getAll<T = unknown>(storeName: string): Promise<T[]> {
          const tx = db.transaction(storeName, 'readonly');
          const result = await promisifyRequest<T[]>(tx.objectStore(storeName).getAll());
          return result ?? [];
        },
        close(): void {
          db.close();
        },
      });
    };
  });
}

