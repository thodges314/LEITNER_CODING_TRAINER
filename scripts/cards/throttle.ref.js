function throttle(fn, wait, options = { leading: true, trailing: true }) {
  let timeout = null;
  let previous = 0;
  let lastArgs, lastThis;
  return function (...args) {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    lastArgs = args; lastThis = this;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) { clearTimeout(timeout); timeout = null; }
      previous = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}
