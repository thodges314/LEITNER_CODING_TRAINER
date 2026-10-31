class GracefulShutdownCoordinator {
  handlers: Array<{ name: string; fn: () => any; priority: number; timeoutMs: number }> = [];
  #promise: Promise<ShutdownReport> | null = null;

  register(name: string, fn: () => any, options: ShutdownHandlerOptions = {}): void {
    this.handlers.push({ name, fn, priority: options.priority || 0, timeoutMs: options.timeoutMs || 0 });
  }

  get isShuttingDown(): boolean {
    return this.#promise !== null;
  }

  shutdown(signal = 'SIGTERM', globalTimeoutMs = 0): Promise<ShutdownReport> {
    return (this.#promise ??= this.#run(signal, globalTimeoutMs));
  }

  async #run(signal: string, globalTimeoutMs: number): Promise<ShutdownReport> {
    const results: TaskResult[] = [];
    const groups = new Map<number, typeof this.handlers>();
    for (const h of this.handlers) {
      if (!groups.has(h.priority)) groups.set(h.priority, []);
      groups.get(h.priority)!.push(h);
    }
    const sorted = [...groups.keys()].sort((a, b) => b - a);

    const exec = async () => {
      for (const p of sorted) {
        const batch = await Promise.all(groups.get(p)!.map(async ({ name, fn, timeoutMs }): Promise<TaskResult> => {
          let timer: any;
          try {
            const p = Promise.resolve().then(fn);
            if (timeoutMs > 0) {
              const to = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('TIMED_OUT')), timeoutMs); });
              await Promise.race([p, to]);
            } else await p;
            return { name, status: 'fulfilled' };
          } catch (err: any) {
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
      await Promise.race([exec(), new Promise<void>(r => setTimeout(() => { completed = false; r(); }, globalTimeoutMs))]);
    } else {
      await exec();
    }
    return { signal, completed, results };
  }
}
