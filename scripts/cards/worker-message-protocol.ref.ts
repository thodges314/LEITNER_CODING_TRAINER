interface WorkerLike {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: 'message' | 'error', listener: (event: any) => void): void;
  removeEventListener(type: 'message' | 'error', listener: (event: any) => void): void;
  terminate?: () => void;
}

interface WorkerRequestOptions {
  timeoutMs?: number;
  transfer?: Transferable[];
}

interface WorkerClient {
  request<TReq = unknown, TRes = unknown>(
    type: string,
    payload: TReq,
    options?: WorkerRequestOptions
  ): Promise<TRes>;
  pendingCount(): number;
  dispose(): void;
}

function createWorkerClient(worker: WorkerLike): WorkerClient {
  let nextId = 1;
  let disposed = false;
  const pending = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: unknown) => void;
      timer: ReturnType<typeof setTimeout> | null;
    }
  >();

  const settleAll = (err: Error): void => {
    for (const entry of pending.values()) {
      if (entry.timer !== null) clearTimeout(entry.timer);
      entry.reject(err);
    }
    pending.clear();
  };

  const handleMessage = (event: any): void => {
    const data = event?.data;
    if (!data || typeof data.id !== 'string') return;
    const entry = pending.get(data.id);
    if (!entry) return;

    pending.delete(data.id);
    if (entry.timer !== null) clearTimeout(entry.timer);

    if (data.ok) {
      entry.resolve(data.result);
    } else {
      entry.reject(new Error(data.error ?? 'Worker error'));
    }
  };

  const handleError = (event: any): void => {
    settleAll(new Error(event?.message || 'Worker error'));
  };

  worker.addEventListener('message', handleMessage);
  worker.addEventListener('error', handleError);

  return {
    request<TReq = unknown, TRes = unknown>(
      type: string,
      payload: TReq,
      options: WorkerRequestOptions = {}
    ): Promise<TRes> {
      if (disposed) {
        return Promise.reject(new Error('Worker client disposed'));
      }

      const id = `req-${nextId++}`;
      return new Promise<TRes>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        if (
          typeof options.timeoutMs === 'number' &&
          Number.isFinite(options.timeoutMs) &&
          options.timeoutMs > 0
        ) {
          timer = setTimeout(() => {
            if (!pending.has(id)) return;
            pending.delete(id);
            reject(new Error('Worker request timed out'));
          }, options.timeoutMs);
        }

        pending.set(id, { resolve, reject, timer });

        if (options.transfer) {
          worker.postMessage({ id, type, payload }, options.transfer);
        } else {
          worker.postMessage({ id, type, payload });
        }
      });
    },
    pendingCount(): number {
      return pending.size;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      settleAll(new Error('Worker client disposed'));
    },
  };
}

