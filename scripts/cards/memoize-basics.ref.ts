function memoizeOne<T, R>(fn: (this: any, arg: T) => R): (this: any, arg: T) => R {
  const cache = new Map<T, R>();
  return function (this: any, arg: T): R {
    if (cache.has(arg)) return cache.get(arg)!;
    const result = fn.call(this, arg);
    cache.set(arg, result);
    return result;
  };
}

function memoizeLast<T, R>(fn: (this: any, arg: T) => R): (this: any, arg: T) => R {
  let hasValue = false;
  let lastArg: T | undefined;
  let lastResult: R | undefined;
  return function (this: any, arg: T): R {
    if (hasValue && Object.is(arg, lastArg)) return lastResult as R;
    lastResult = fn.call(this, arg);
    lastArg = arg;
    hasValue = true;
    return lastResult;
  };
}
