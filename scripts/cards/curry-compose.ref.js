function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x);
}

function compose(...fns) {
  return (x) => fns.reduceRight((v, f) => f(v), x);
}
