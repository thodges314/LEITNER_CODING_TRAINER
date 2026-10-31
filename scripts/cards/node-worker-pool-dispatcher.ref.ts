class WorkerPoolDispatcher {
  size: number;
  maxQueueSize: number;
  active = 0;
  queue: Array<{ data: any; executeFn: (d: any) => any; resolve: (v: any) => void; reject: (e: any) => void }> = [];
  terminated = false;
  drains: Array<() => void> = [];

  constructor(options: WorkerPoolOptions = {}) {
    this.size = options.size || 2;
    this.maxQueueSize = options.maxQueueSize ?? Infinity;
  }

  dispatch<T, R>(data: T, executeFn: (arg: T) => R | Promise<R>): Promise<R> {
    if (this.terminated) return Promise.reject(new Error('Pool terminated'));
    if (this.active < this.size) return this.#run(data, executeFn);
    if (this.queue.length >= this.maxQueueSize) return Promise.reject(new Error('Queue full'));
    return new Promise((resolve, reject) => this.queue.push({ data, executeFn, resolve, reject }));
  }

  async #run(data: any, executeFn: (d: any) => any): Promise<any> {
    this.active++;
    try {
      return await executeFn(data);
    } finally {
      this.active--;
      if (!this.active) while (this.drains.length) this.drains.shift()!();
      if (!this.terminated && this.queue.length && this.active < this.size) {
        const { data: d, executeFn: fn, resolve, reject } = this.queue.shift()!;
        this.#run(d, fn).then(resolve, reject);
      }
    }
  }

  getStats(): WorkerPoolStats {
    return {
      size: this.size,
      busyWorkers: this.active,
      idleWorkers: this.size - this.active,
      pendingQueueLength: this.queue.length,
    };
  }

  async terminate(): Promise<void> {
    this.terminated = true;
    while (this.queue.length) this.queue.shift()!.reject(new Error('Pool terminated'));
    if (this.active) await new Promise<void>(r => this.drains.push(r));
  }
}
