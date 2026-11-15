function createClsTracker(options = {}) {
  const { onUpdate } = options;

  let maxCls = 0;
  let windowValue = 0;
  let windowStartTime = -Infinity;
  let lastEntryTime = -Infinity;

  const recordEntry = (entry) => {
    if (!entry || entry.hadRecentInput) {
      return maxCls;
    }

    const gap = entry.startTime - lastEntryTime;
    const span = entry.startTime - windowStartTime;

    if (windowStartTime !== -Infinity && gap < 1000 && span <= 5000) {
      windowValue += entry.value;
      lastEntryTime = entry.startTime;
    } else {
      windowValue = entry.value;
      windowStartTime = entry.startTime;
      lastEntryTime = entry.startTime;
    }

    if (windowValue > maxCls) {
      maxCls = windowValue;
      if (typeof onUpdate === 'function') {
        onUpdate(maxCls);
      }
    }

    return maxCls;
  };

  const startObserving = (ObserverCtor = typeof PerformanceObserver !== 'undefined' ? PerformanceObserver : undefined) => {
    if (typeof ObserverCtor !== 'function') {
      return () => {};
    }

    const observer = new ObserverCtor((list) => {
      for (const entry of list.getEntries()) {
        recordEntry(entry);
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    return () => observer.disconnect();
  };

  const reset = () => {
    maxCls = 0;
    windowValue = 0;
    windowStartTime = -Infinity;
    lastEntryTime = -Infinity;
  };

  return {
    recordEntry,
    startObserving,
    getCls: () => maxCls,
    reset,
  };
}

