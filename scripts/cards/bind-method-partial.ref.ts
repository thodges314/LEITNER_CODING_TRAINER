function bindMethod<T extends Record<string, any>>(obj: T, name: keyof T): (...args: any[]) => any {
  return (...args: any[]) => (obj as any)[name](...args);
}

function partial(fn: (...args: any[]) => any, ...preset: any[]): (...later: any[]) => any {
  return function (this: any, ...later: any[]) {
    return fn.apply(this, [...preset, ...later]);
  };
}
