function createValidated(target, schema) {
  return new Proxy(target, {
    set(t, key, value, receiver) {
      if (!(key in schema)) throw new TypeError('Unknown property: ' + String(key));
      if (!schema[key](value)) throw new TypeError('Invalid value for ' + String(key));
      return Reflect.set(t, key, value, receiver);
    },
    deleteProperty(t, key) {
      if (key in schema) throw new TypeError('Cannot delete ' + String(key));
      return Reflect.deleteProperty(t, key);
    },
    has(t, key) {
      if (typeof key === 'string' && key.startsWith('_')) return false;
      return Reflect.has(t, key);
    },
    ownKeys(t) {
      return Reflect.ownKeys(t).filter((k) => !(typeof k === 'string' && k.startsWith('_')));
    },
  });
}
