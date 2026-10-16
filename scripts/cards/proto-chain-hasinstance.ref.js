function getProtoChain(obj) {
  const chain = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return chain;
}

function findOwner(obj, key) {
  let node = obj;
  while (node) {
    if (Object.prototype.hasOwnProperty.call(node, key)) return node;
    node = Object.getPrototypeOf(node);
  }
  return null;
}

function myInstanceOf(value, Ctor) {
  if (typeof Ctor !== 'function') throw new TypeError('Right-hand side is not callable');
  const custom = Ctor[Symbol.hasInstance];
  if (custom !== undefined && custom !== Function.prototype[Symbol.hasInstance]) {
    return !!custom.call(Ctor, value);
  }
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(value);
  while (proto) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
