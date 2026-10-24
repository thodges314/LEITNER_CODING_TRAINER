type KeyFn<T> = (item: T, index: number) => PropertyKey;
type KeyOrFn<T> = KeyFn<T> | keyof T;

function toKeyFn<T>(keyFnOrProp: KeyOrFn<T>): KeyFn<T> {
  return typeof keyFnOrProp === 'function' ? keyFnOrProp : (x: T) => x[keyFnOrProp] as PropertyKey;
}

function groupBy<T>(items: T[], keyFnOrProp: KeyOrFn<T>): Record<string, T[]> {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce<Record<string, T[]>>((acc, item, idx) => {
    const key = String(fn(item, idx));
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function countBy<T>(items: T[], keyFnOrProp: KeyOrFn<T>): Record<string, number> {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce<Record<string, number>>((acc, item, idx) => {
    const key = String(fn(item, idx));
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function keyBy<T>(items: T[], keyFnOrProp: KeyOrFn<T>): Record<string, T> {
  const fn = toKeyFn(keyFnOrProp);
  return items.reduce<Record<string, T>>((acc, item, idx) => {
    acc[String(fn(item, idx))] = item; // last item wins on duplicate keys
    return acc;
  }, {});
}
