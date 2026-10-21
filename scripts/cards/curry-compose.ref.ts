function curry(fn: (...args: any[]) => any): (...args: any[]) => any {
  return function curried(this: any, ...args: any[]): any {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...nextArgs: any[]) => curried.apply(this, [...args, ...nextArgs]);
  };
}

function pipe(...fns: Array<(arg: any) => any>): (x?: any) => any {
  return (x?: any) => fns.reduce((v, f) => f(v), x);
}

function compose(...fns: Array<(arg: any) => any>): (x?: any) => any {
  return (x?: any) => fns.reduceRight((v, f) => f(v), x);
}
