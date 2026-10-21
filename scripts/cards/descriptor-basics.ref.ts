function defineHidden<T extends object>(obj: T, key: string | symbol, value: any): T {
  return Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

function defineConstant<T extends object>(obj: T, key: string | symbol, value: any): T {
  return Object.defineProperty(obj, key, {
    value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
}

function describeFlags(
  obj: any,
  key: string | symbol
): { writable?: boolean; enumerable?: boolean; configurable?: boolean; accessor?: boolean } | undefined {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  if (!d) return undefined;
  if ('value' in d) {
    return { writable: d.writable, enumerable: d.enumerable, configurable: d.configurable };
  }
  return { enumerable: d.enumerable, configurable: d.configurable, accessor: true };
}
