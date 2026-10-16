function inheritFrom(proto, props = {}) {
  const obj = Object.create(proto);
  Object.assign(obj, props);
  return obj;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function protoChainLength(obj) {
  let count = 0;
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    count++;
    proto = Object.getPrototypeOf(proto);
  }
  return count;
}
