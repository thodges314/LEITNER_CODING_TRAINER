function deepEqual(a: unknown, b: unknown, seen: WeakMap<object, unknown> = new WeakMap()): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false; // array vs object, Date vs object, ...
  if (a instanceof Date) return a.getTime() === (b as Date).getTime();
  if (seen.get(a) === b) return true; // circular reference already being compared
  seen.set(a, b);
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(objB, k) && deepEqual(objA[k], objB[k], seen));
}
