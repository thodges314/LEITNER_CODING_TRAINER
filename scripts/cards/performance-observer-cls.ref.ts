interface LayoutShiftEntry {
  value: number;
  startTime: number;
  hadRecentInput: boolean;
}

interface ClsTrackerOptions {
  onUpdate?: (cls: number) => void;
}

interface ClsTracker {
  recordEntry(entry: LayoutShiftEntry): number;
  startObserving(ObserverCtor?: any): () => void;
  getCls(): number;
  reset(): void;
}

function createClsTracker(options: ClsTrackerOptions = {}): ClsTracker {
  const { onUpdate } = options;

  let maxCls = 0;
  let windowValue = 0;
  let windowStartTime = -Infinity;
  let lastEntryTime = -Infinity;

  const recordEntry = (entry: LayoutShiftEntry): number => {
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

  const startObserving = (
    ObserverCtor: any = typeof PerformanceObserver !== 'undefined' ? PerformanceObserver : undefined
  ): (() => void) => {
    if (typeof ObserverCtor !== 'function') {
      return () => {};
    }

    const observer = new ObserverCtor((list: { getEntries: () => LayoutShiftEntry[] }) => {
      for (const entry of list.getEntries()) {
        recordEntry(entry);
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    return () => observer.disconnect();
  };

  const reset = (): void => {
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

