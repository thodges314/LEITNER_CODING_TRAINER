function createReadOnly(obj) {
  const revokers = [];
  const wrap = (target) => {
    const { proxy, revoke } = Proxy.revocable(target, {
      get(t, key, receiver) {
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
    return proxy;
  };
  const proxy = wrap(obj);
  return {
    proxy,
    revoke() {
      revokers.forEach((r) => r());
    },
  };
}
