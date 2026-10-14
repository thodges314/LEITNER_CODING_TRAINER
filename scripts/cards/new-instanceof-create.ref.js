function objectCreate(proto, propertiesObject) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  if (propertiesObject) Object.defineProperties(obj, propertiesObject);
  return obj;
}

function myNew(Constructor, ...args) {
  const obj = objectCreate(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function');
  return isObject ? result : obj;
}

function myInstanceOf(value, Constructor) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  let proto = Object.getPrototypeOf(value);
  while (proto !== null) {
    if (proto === Constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
