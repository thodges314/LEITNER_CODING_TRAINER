function createThermometer(celsius) {
  const t = { celsius };
  Object.defineProperty(t, 'fahrenheit', {
    get() {
      return (this.celsius * 9) / 5 + 32;
    },
    set(f) {
      this.celsius = ((f - 32) * 5) / 9;
    },
    enumerable: false,
    configurable: true,
  });
  return t;
}

function defineLazy(obj, key, compute) {
  Object.defineProperty(obj, key, {
    get() {
      const value = compute();
      Object.defineProperty(obj, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      return value;
    },
    enumerable: true,
    configurable: true,
  });
  return obj;
}
