interface WorkerPoolOptions {
  size: number;
  maxQueueSize?: number;
}

interface PoolStats {
  size: number;
  busyWorkers: number;
  idleWorkers: number;
  pendingQueueLength: number;
}

interface PoolWorker {
  id: number;
  busy: boolean;
  completed: number;
}

interface PendingTask {
  data: any;
  executeFn: (data: any) => Promise<any> | any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class WorkerPoolDispatcher {
  public size: number;
  public maxQueueSize: number;
  private workers: PoolWorker[];
  private queue: PendingTask[];
  private terminated: boolean;
  private activeTaskCount: number;
  private _drainResolvers: Array<() => void>;

  constructor(options: WorkerPoolOptions) {
    this.size = options.size || 2;
    this.maxQueueSize = options.maxQueueSize || Infinity;
    this.workers = Array.from({ length: this.size }, (_, i) => ({
      id: i,
      busy: false,
      completed: 0,
    }));
    this.queue = [];
    this.terminated = false;
    this.activeTaskCount = 0;
    this._drainResolvers = [];
  }

  dispatch(data: any, executeFn: (data: any) => Promise<any> | any): Promise<any> {
    if (this.terminated) {
      return Promise.reject(new Error('Pool terminated'));
    }

    const idleWorker = this.workers.find((w) => !w.busy);
    if (idleWorker) {
      return this._runTask(idleWorker, data, executeFn);
    }

    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(new Error('Queue full'));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ data, executeFn, resolve, reject });
    });
  }

  private async _runTask(
    worker: PoolWorker,
    data: any,
    executeFn: (data: any) => Promise<any> | any
  ): Promise<any> {
    worker.busy = true;
    this.activeTaskCount++;
    try {
      const result = await executeFn(data);
      return result;
    } finally {
      worker.completed++;
      worker.busy = false;
      this.activeTaskCount--;
      if (this.activeTaskCount === 0 && this._drainResolvers.length > 0) {
        const resolvers = [...this._drainResolvers];
        this._drainResolvers = [];
        for (const r of resolvers) r();
      }
      this._drainQueue();
    }
  }

  private _drainQueue(): void {
    if (this.terminated || this.queue.length === 0) return;
    const idleWorker = this.workers.find((w) => !w.busy);
    if (!idleWorker) return;

    const task = this.queue.shift();
    if (!task) return;

    this._runTask(idleWorker, task.data, task.executeFn).then(task.resolve, task.reject);
  }

  getStats(): PoolStats {
    const busyWorkers = this.workers.filter((w) => w.busy).length;
    return {
      size: this.size,
      busyWorkers,
      idleWorkers: this.size - busyWorkers,
      pendingQueueLength: this.queue.length,
    };
  }

  async terminate(): Promise<void> {
    this.terminated = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) task.reject(new Error('Pool terminated'));
    }
    if (this.activeTaskCount === 0) return;
    await new Promise<void>((resolve) => {
      this._drainResolvers.push(resolve);
    });
  }
}
