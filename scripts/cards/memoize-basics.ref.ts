function memoizeOne<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  return (arg: T): R => {
    if (cache.has(arg)) return cache.get(arg)!;
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

function memoizeLast<T, R>(fn: (arg: T) => R): (arg: T) => R {
  let hasValue = false;
  let lastArg: T | undefined;
  let lastResult: R | undefined;

  return (arg: T): R => {
    if (hasValue && Object.is(arg, lastArg)) return lastResult as R;
    lastResult = fn(arg);
    lastArg = arg;
    hasValue = true;
    return lastResult;
  };
}
