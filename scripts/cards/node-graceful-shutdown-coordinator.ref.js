class GracefulShutdownCoordinator {
  handlers = [];
  #promise = null;

  register(name, fn, options = {}) {
    this.handlers.push({ name, fn, priority: options.priority || 0, timeoutMs: options.timeoutMs || 0 });
  }

  get isShuttingDown() {
    return this.#promise !== null;
  }

  shutdown(signal = 'SIGTERM', globalTimeoutMs = 0) {
    return (this.#promise ??= this.#run(signal, globalTimeoutMs));
  }

  async #run(signal, globalTimeoutMs) {
    const results = [];
    const groups = new Map();
    for (const h of this.handlers) {
      if (!groups.has(h.priority)) groups.set(h.priority, []);
      groups.get(h.priority).push(h);
    }
    const sorted = [...groups.keys()].sort((a, b) => b - a);

    const exec = async () => {
      for (const p of sorted) {
        const batch = await Promise.all(groups.get(p).map(async ({ name, fn, timeoutMs }) => {
          let timer;
          try {
            const p = Promise.resolve().then(fn);
            if (timeoutMs > 0) {
              const to = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('TIMED_OUT')), timeoutMs); });
              await Promise.race([p, to]);
            } else await p;
            return { name, status: 'fulfilled' };
          } catch (err) {
            return { name, status: err?.message === 'TIMED_OUT' ? 'timed_out' : 'rejected', error: err?.message || String(err) };
          } finally {
            clearTimeout(timer);
          }
        }));
        results.push(...batch);
      }
    };

    let completed = true;
    if (globalTimeoutMs > 0) {
      await Promise.race([exec(), new Promise(r => setTimeout(() => { completed = false; r(); }, globalTimeoutMs))]);
    } else {
      await exec();
    }
    return { signal, completed, results };
  }
}
