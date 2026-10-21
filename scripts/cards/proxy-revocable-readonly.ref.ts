function createReadOnly<T extends object>(obj: T): { proxy: T; revoke: () => void } {
  const revokers: Array<() => void> = [];
  const wrap = <U extends object>(target: U): U => {
    const { proxy, revoke } = Proxy.revocable(target, {
      get(t: any, key: string | symbol, receiver: any) {
        const value = Reflect.get(t, key, receiver);
        return value !== null && typeof value === 'object' ? wrap(value) : value;
      },
      set() {
        throw new TypeError('Read-only');
      },
      defineProperty() {
        throw new TypeError('Read-only');
      },
      deleteProperty() {
        throw new TypeError('Read-only');
      },
    });
    revokers.push(revoke);
    return proxy as U;
  };
  const proxy = wrap(obj);
  return {
    proxy,
    revoke() {
      revokers.forEach((r) => r());
    },
  };
}
