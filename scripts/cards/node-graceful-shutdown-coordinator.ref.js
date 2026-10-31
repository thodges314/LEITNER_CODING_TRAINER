class GracefulShutdownCoordinator {
  constructor() {
    this.handlers = [];
    this._isShuttingDown = false;
    this._shutdownPromise = null;
  }

  register(name, fn, options = {}) {
    this.handlers.push({
      name,
      fn,
      priority: options.priority || 0,
      timeoutMs: options.timeoutMs || 0,
    });
  }

  get isShuttingDown() {
    return this._isShuttingDown;
  }

  shutdown(signal = 'SIGTERM', globalTimeoutMs = 0) {
    if (this._shutdownPromise) {
      return this._shutdownPromise;
    }

    this._isShuttingDown = true;
    this._shutdownPromise = this._executeShutdown(signal, globalTimeoutMs);
    return this._shutdownPromise;
  }

  async _executeShutdown(signal, globalTimeoutMs) {
    const results = [];
    let timedOutGlobal = false;

    const groups = {};
    for (const h of this.handlers) {
      if (!groups[h.priority]) groups[h.priority] = [];
      groups[h.priority].push(h);
    }
    const priorities = Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a);

    const runTask = async (task) => {
      let timer;
      try {
        const promise = Promise.resolve().then(() => task.fn());
        if (task.timeoutMs > 0) {
          const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('TIMED_OUT')), task.timeoutMs);
          });
          await Promise.race([promise, timeoutPromise]);
        } else {
          await promise;
        }
        return { name: task.name, status: 'fulfilled' };
      } catch (err) {
        if (err && err.message === 'TIMED_OUT') {
          return { name: task.name, status: 'timed_out', error: 'Task timed out' };
        }
        return {
          name: task.name,
          status: 'rejected',
          error: err ? String(err.message || err) : 'Error',
        };
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    const runAll = async () => {
      for (const p of priorities) {
        if (timedOutGlobal) break;
        const tasks = groups[p];
        const groupResults = await Promise.all(tasks.map(runTask));
        results.push(...groupResults);
      }
    };

    if (globalTimeoutMs > 0) {
      let globalTimer;
      const globalTimeoutPromise = new Promise((resolve) => {
        globalTimer = setTimeout(() => {
          timedOutGlobal = true;
          resolve(undefined);
        }, globalTimeoutMs);
      });
      await Promise.race([runAll(), globalTimeoutPromise]);
      if (globalTimer) clearTimeout(globalTimer);
    } else {
      await runAll();
    }

    return {
      signal,
      completed: !timedOutGlobal,
      results,
    };
  }
}
