function negativeIndex(arr) {
  const toIndex = (key, length) => {
    if (typeof key === 'string' && /^-\d+$/.test(key)) return length + Number(key);
    return null;
  };
  return new Proxy(arr, {
    get(target, key, receiver) {
      const i = toIndex(key, target.length);
      if (i !== null) return i >= 0 ? target[i] : undefined;
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const i = toIndex(key, target.length);
      if (i !== null) {
        if (i < 0) throw new RangeError('Index out of range: ' + key);
        target[i] = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}
