Function.prototype.myBind = function (this: any, context: any, ...boundArgs: any[]): (...args: any[]) => any {
  const fn = this;
  return function bound(this: any, ...args: any[]): any {
    if (this instanceof bound) {
      return new (fn as any)(...boundArgs, ...args);
    }
    return fn.myApply(context, [...boundArgs, ...args]);
  };
};

Function.prototype.myCall = function (this: any, context: any, ...args: any[]): any {
  const ctx: any = context == null ? globalThis : Object(context);
  const key: any = Symbol('fn');
  Object.defineProperty(ctx, key, { value: this, configurable: true });
  try {
    return ctx[key](...args);
  } finally {
    delete ctx[key];
  }
};

Function.prototype.myApply = function (this: any, context: any, args: any[] = []): any {
  return this.myCall(context, ...args);
};
