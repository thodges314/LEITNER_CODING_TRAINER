interface Thermometer {
  celsius: number;
  fahrenheit: number;
}

function createThermometer(celsius: number): Thermometer {
  const t: any = { celsius };
  Object.defineProperty(t, 'fahrenheit', {
    get(this: Thermometer) {
      return (this.celsius * 9) / 5 + 32;
    },
    set(this: Thermometer, f: number) {
      this.celsius = ((f - 32) * 5) / 9;
    },
    enumerable: false,
    configurable: true,
  });
  return t as Thermometer;
}

function defineLazy<T extends object>(obj: T, key: string | symbol, compute: () => any): T {
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
