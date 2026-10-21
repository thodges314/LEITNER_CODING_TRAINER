function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (this: any, ...args: Parameters<T>) => any
): (this: any, ...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<any, ReturnType<T>>();
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver.apply(this, args) : args[0];
    if (cache.has(key)) return cache.get(key)!;
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
