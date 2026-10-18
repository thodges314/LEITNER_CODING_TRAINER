function rafThrottle(fn, raf = (cb) => requestAnimationFrame(cb), caf = (id) => cancelAnimationFrame(id)) {
  let frameId = null;
  let latestArgs = [];

  const throttled = (...args) => {
    latestArgs = args;
    if (frameId !== null) return;
    frameId = raf(() => {
      frameId = null;
      fn(...latestArgs);
    });
  };

  throttled.cancel = () => {
    if (frameId === null) return;
    caf(frameId);
    frameId = null;
  };

  return throttled;
}
