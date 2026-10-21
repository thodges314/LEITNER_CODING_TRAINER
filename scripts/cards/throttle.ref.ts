interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: ThrottleOptions = { leading: true, trailing: true }
): (this: any, ...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        fn.apply(lastThis, lastArgs!);
      }, remaining);
    }
  };
}
