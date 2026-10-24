type RafFn = (callback: (time: number) => void) => number;
type CafFn = (handle: number) => void;

interface ThrottledFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
}

function rafThrottle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  raf: RafFn = (cb) => requestAnimationFrame(cb),
  caf: CafFn = (id) => cancelAnimationFrame(id),
): ThrottledFunction<TArgs> {
  let frameId: number | null = null;
  let latestArgs: TArgs = [] as unknown as TArgs;

  const throttled = ((...args: TArgs) => {
    latestArgs = args;
    if (frameId !== null) return;
    frameId = raf(() => {
      frameId = null;
      fn(...latestArgs);
    });
  }) as ThrottledFunction<TArgs>;

  throttled.cancel = () => {
    if (frameId === null) return;
    caf(frameId);
    frameId = null;
  };

  return throttled;
}
