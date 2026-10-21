function withDefaults<T extends object, D extends object>(target: T, defaults: D): T & D {
  return new Proxy(target, {
    get(t: any, key: string | symbol, receiver: any) {
      return key in t ? Reflect.get(t, key, receiver) : (defaults as any)[key];
    },
  }) as T & D;
}

function countAccesses<T extends object>(target: T): { proxy: T; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  const proxy = new Proxy(target, {
    get(t: any, key: string | symbol, receiver: any) {
      if (typeof key === 'string') counts[key] = (counts[key] || 0) + 1;
      return Reflect.get(t, key, receiver);
    },
  });
  return { proxy, counts };
}
