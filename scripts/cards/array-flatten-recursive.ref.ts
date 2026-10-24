type Nested<T> = T | Nested<T>[];

function flatten<T>(arr: Nested<T>[]): T[] {
  let res: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) res = res.concat(flatten<T>(item));
    else res.push(item as T);
  }
  return res;
}
