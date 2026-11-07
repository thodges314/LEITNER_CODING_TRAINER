function createAsyncTester() {
  const flushMicrotasks = async (ticks = 1) => {
    for (let i = 0; i < Math.max(1, ticks); i++) {
      await new Promise((resolve) => {
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(resolve);
        } else {
          Promise.resolve().then(resolve);
        }
      });
    }
  };

  const flushMacrotasks = async (count = 1) => {
    for (let i = 0; i < Math.max(1, count); i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  const pumpEventQueue = async (cycles = 1) => {
    for (let i = 0; i < Math.max(1, cycles); i++) {
      await flushMacrotasks(1);
      await flushMicrotasks(1);
    }
  };

  const waitForCondition = async (predicate, options = {}) => {
    const { timeout = 1000, interval = 10 } = options;
    const startTime = Date.now();

    while (true) {
      try {
        const result = await predicate();
        if (result) {
          return result;
        }
      } catch (err) {
        // If error thrown within timeout, continue polling unless timed out
      }

      if (Date.now() - startTime >= timeout) {
        throw new Error('Timed out waiting for condition');
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  };

  return {
    flushMicrotasks,
    flushMacrotasks,
    pumpEventQueue,
    waitForCondition,
  };
}
