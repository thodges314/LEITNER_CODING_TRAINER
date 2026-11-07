interface WaitForOptions {
  timeout?: number;
  interval?: number;
}

interface AsyncTestingSuite {
  flushMicrotasks(ticks?: number): Promise<void>;
  flushMacrotasks(count?: number): Promise<void>;
  pumpEventQueue(cycles?: number): Promise<void>;
  waitForCondition<T>(
    predicate: () => T | Promise<T>,
    options?: WaitForOptions
  ): Promise<T>;
}

function createAsyncTester(): AsyncTestingSuite {
  const flushMicrotasks = async (ticks = 1): Promise<void> => {
    for (let i = 0; i < Math.max(1, ticks); i++) {
      await new Promise<void>((resolve) => {
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(resolve);
        } else {
          Promise.resolve().then(resolve);
        }
      });
    }
  };

  const flushMacrotasks = async (count = 1): Promise<void> => {
    for (let i = 0; i < Math.max(1, count); i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  };

  const pumpEventQueue = async (cycles = 1): Promise<void> => {
    for (let i = 0; i < Math.max(1, cycles); i++) {
      await flushMacrotasks(1);
      await flushMicrotasks(1);
    }
  };

  const waitForCondition = async <T>(
    predicate: () => T | Promise<T>,
    options: WaitForOptions = {}
  ): Promise<T> => {
    const { timeout = 1000, interval = 10 } = options;
    const startTime = Date.now();

    while (true) {
      try {
        const result = await predicate();
        if (result) {
          return result;
        }
      } catch {
        // If error thrown within timeout, continue polling unless timed out
      }

      if (Date.now() - startTime >= timeout) {
        throw new Error('Timed out waiting for condition');
      }

      await new Promise<void>((resolve) => setTimeout(resolve, interval));
    }
  };

  return {
    flushMicrotasks,
    flushMacrotasks,
    pumpEventQueue,
    waitForCondition,
  };
}
