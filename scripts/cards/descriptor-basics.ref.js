function defineHidden(obj, key, value) {
  return Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

function defineConstant(obj, key, value) {
  return Object.defineProperty(obj, key, {
    value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
}

function describeFlags(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  if (!d) return undefined;
  if ('value' in d) {
    return { writable: d.writable, enumerable: d.enumerable, configurable: d.configurable };
  }
  return { enumerable: d.enumerable, configurable: d.configurable, accessor: true };
}
