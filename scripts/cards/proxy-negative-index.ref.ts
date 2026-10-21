function negativeIndex<T>(arr: T[]): T[] {
  const toIndex = (key: string | symbol, length: number): number | null => {
    if (typeof key === 'string' && /^-\d+$/.test(key)) return length + Number(key);
    return null;
  };
  return new Proxy(arr, {
    get(target: any, key: string | symbol, receiver: any) {
      const i = toIndex(key, target.length);
      if (i !== null) return i >= 0 ? target[i] : undefined;
      return Reflect.get(target, key, receiver);
    },
    set(target: any, key: string | symbol, value: any, receiver: any) {
      const i = toIndex(key, target.length);
      if (i !== null) {
        if (i < 0) throw new RangeError('Index out of range: ' + String(key));
        target[i] = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}
