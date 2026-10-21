function createValidated<T extends object>(
  target: T,
  schema: Record<string, (val: unknown) => boolean>
): T {
  return new Proxy(target, {
    set(t: any, key: string | symbol, value: any, receiver: any) {
      if (!(key in schema)) throw new TypeError('Unknown property: ' + String(key));
      if (!schema[key as string](value)) throw new TypeError('Invalid value for ' + String(key));
      return Reflect.set(t, key, value, receiver);
    },
    deleteProperty(t: any, key: string | symbol) {
      if (key in schema) throw new TypeError('Cannot delete ' + String(key));
      return Reflect.deleteProperty(t, key);
    },
    has(t: any, key: string | symbol) {
      if (typeof key === 'string' && key.startsWith('_')) return false;
      return Reflect.has(t, key);
    },
    ownKeys(t: any) {
      return Reflect.ownKeys(t).filter((k) => !(typeof k === 'string' && k.startsWith('_')));
    },
  });
}
