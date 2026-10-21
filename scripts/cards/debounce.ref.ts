interface DebouncedFunction<T extends (...args: any[]) => any> {
  (this: any, ...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  function debounced(this: any, ...args: Parameters<T>): void {
    lastArgs = args;
    lastThis = this;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(lastThis, lastArgs!);
      timer = null;
    }, wait);
  }

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      fn.apply(lastThis, lastArgs!);
      timer = null;
    }
  };

  return debounced;
}
