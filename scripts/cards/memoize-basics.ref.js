function memoizeOne(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

function memoizeLast(fn) {
  let hasValue = false;
  let lastArg;
  let lastResult;
  return function (arg) {
    if (hasValue && Object.is(arg, lastArg)) return lastResult;
    lastResult = fn(arg);
    lastArg = arg;
    hasValue = true;
    return lastResult;
  };
}
