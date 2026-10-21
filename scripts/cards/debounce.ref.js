function debounce(fn, wait) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(lastThis, lastArgs);
      timer = null;
    }, wait);
  }
  debounced.cancel = () => { clearTimeout(timer); timer = null; };
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      fn.apply(lastThis, lastArgs);
      timer = null;
    }
  };
  return debounced;
}
