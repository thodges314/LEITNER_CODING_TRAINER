interface Array<T> {
  myMap<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: unknown): U[];
  myFilter(callback: (value: T, index: number, array: T[]) => unknown, thisArg?: unknown): T[];
  myReduce<U = T>(callback: (accumulator: U, value: T, index: number, array: T[]) => U, initialValue?: U): U;
}

const define = (name: string, fn: (...args: never[]) => unknown): void => {
  Object.defineProperty(Array.prototype, name, { value: fn, writable: true, configurable: true });
};

define('myMap', function <T, U>(this: T[], callback: (value: T, index: number, array: T[]) => U, thisArg?: unknown): U[] {
  const res = new Array<U>(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) res[i] = callback.call(thisArg, this[i], i, this);
  }
  return res;
});

define('myFilter', function <T>(this: T[], callback: (value: T, index: number, array: T[]) => unknown, thisArg?: unknown): T[] {
  const res: T[] = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) res.push(this[i]);
  }
  return res;
});

define('myReduce', function <T, U>(this: T[], callback: (accumulator: U, value: T, index: number, array: T[]) => U, initialValue?: U): U {
  let i = 0;
  let acc: U;
  if (arguments.length >= 2) {
    acc = initialValue as U;
  } else {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++] as unknown as U;
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
});
