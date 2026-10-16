function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(t, key, receiver) {
      return key in t ? Reflect.get(t, key, receiver) : defaults[key];
    },
  });
}

function countAccesses(target) {
  const counts = {};
  const proxy = new Proxy(target, {
    get(t, key, receiver) {
      if (typeof key === 'string') counts[key] = (counts[key] || 0) + 1;
      return Reflect.get(t, key, receiver);
    },
  });
  return { proxy, counts };
}
