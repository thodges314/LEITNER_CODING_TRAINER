interface QueuedMutation<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  createdAt: number;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface OnlineEventTarget {
  addEventListener(type: 'online', listener: () => void): void;
  removeEventListener(type: 'online', listener: () => void): void;
}

interface OfflineQueueOptions<TPayload = unknown> {
  execute: (mutation: QueuedMutation<TPayload>) => Promise<void>;
  storageKey?: string;
  storage?: StorageLike;
  onlineTarget?: OnlineEventTarget;
}

interface FlushResult {
  succeeded: number;
  failed: number;
  remaining: number;
}

interface OfflineMutationQueue<TPayload = unknown> {
  enqueue(type: string, payload: TPayload): QueuedMutation<TPayload>;
  flush(): Promise<FlushResult>;
  getPending(): QueuedMutation<TPayload>[];
  destroy(): void;
}

function createOfflineMutationQueue<TPayload = unknown>(
  options: OfflineQueueOptions<TPayload>
): OfflineMutationQueue<TPayload> {
  const {
    execute,
    storageKey = 'offline_mutations',
    storage = window.localStorage,
    onlineTarget = window,
  } = options;

  let seq = 1;
  let activeFlush: Promise<FlushResult> | null = null;

  const readQueue = (): QueuedMutation<TPayload>[] => {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeQueue = (items: QueuedMutation<TPayload>[]): void => {
    storage.setItem(storageKey, JSON.stringify(items));
  };

  const flush = (): Promise<FlushResult> => {
    if (activeFlush) return activeFlush;

    activeFlush = (async (): Promise<FlushResult> => {
      let succeeded = 0;
      let failed = 0;

      while (true) {
        const queue = readQueue();
        if (queue.length === 0) break;

        const next = queue[0];
        try {
          await execute(next);
          succeeded += 1;
          const latest = readQueue();
          writeQueue(latest.filter((item) => item.id !== next.id));
        } catch {
          failed = 1;
          break;
        }
      }

      const remaining = readQueue().length;
      return { succeeded, failed, remaining };
    })().finally(() => {
      activeFlush = null;
    });

    return activeFlush;
  };

  const handleOnline = (): void => {
    void flush();
  };

  onlineTarget.addEventListener('online', handleOnline);

  return {
    enqueue(type: string, payload: TPayload): QueuedMutation<TPayload> {
      const entry: QueuedMutation<TPayload> = {
        id: `mut-${Date.now()}-${seq++}`,
        type,
        payload,
        createdAt: Date.now(),
      };
      const queue = readQueue();
      queue.push(entry);
      writeQueue(queue);
      return entry;
    },
    flush,
    getPending(): QueuedMutation<TPayload>[] {
      return readQueue();
    },
    destroy(): void {
      onlineTarget.removeEventListener('online', handleOnline);
    },
  };
}

