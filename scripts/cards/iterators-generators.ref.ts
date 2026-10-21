function* range(start: number, end: number, step = 1): Generator<number, void, unknown> {
  if (step > 0) {
    for (let i = start; i < end; i += step) yield i;
  } else if (step < 0) {
    for (let i = start; i > end; i += step) yield i;
  }
}

function* take<T>(iterable: Iterable<T>, n: number): Generator<T, void, unknown> {
  if (n <= 0) return;
  let count = 0;
  for (const item of iterable) {
    yield item;
    if (++count >= n) return; // leaving the loop calls iterator.return() on the source
  }
}

function* mapIter<T, U>(iterable: Iterable<T>, fn: (item: T) => U): Generator<U, void, unknown> {
  for (const item of iterable) yield fn(item);
}

function* zip(...iterables: Iterable<any>[]): Generator<any[], void, unknown> {
  const iterators = iterables.map((it) => it[Symbol.iterator]());
  try {
    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((r) => r.done)) return;
      yield results.map((r) => r.value);
    }
  } finally {
    iterators.forEach((it: any) => it.return && it.return());
  }
}

class Countdown implements Iterable<number> {
  n: number;
  constructor(n: number) {
    this.n = n;
  }
  *[Symbol.iterator](): Generator<number, void, unknown> {
    for (let i = this.n; i > 0; i--) yield i;
  }
}
