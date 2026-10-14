Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  return function bound(...args) {
    if (this instanceof bound) {
      return new fn(...boundArgs, ...args);
    }
    return fn.myApply(context, [...boundArgs, ...args]);
  };
};

Function.prototype.myCall = function (context, ...args) {
  const ctx = context == null ? globalThis : Object(context);
  const key = Symbol('fn'); // a unique key, so nothing on the context is overwritten
  Object.defineProperty(ctx, key, { value: this, configurable: true });
  try {
    return ctx[key](...args);
  } finally {
    delete ctx[key];
  }
};

Function.prototype.myApply = function (context, args = []) {
  return this.myCall(context, ...args);
};
