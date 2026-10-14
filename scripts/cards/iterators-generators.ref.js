function* range(start, end, step = 1) {
  if (step > 0) for (let i = start; i < end; i += step) yield i;
  else if (step < 0) for (let i = start; i > end; i += step) yield i;
}

function* take(iterable, n) {
  if (n <= 0) return;
  let count = 0;
  for (const item of iterable) {
    yield item;
    if (++count >= n) return; // leaving the loop calls iterator.return() on the source
  }
}

function* mapIter(iterable, fn) {
  for (const item of iterable) yield fn(item);
}

function* zip(...iterables) {
  const iterators = iterables.map((it) => it[Symbol.iterator]());
  try {
    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((r) => r.done)) return;
      yield results.map((r) => r.value);
    }
  } finally {
    iterators.forEach((it) => it.return && it.return());
  }
}

class Countdown {
  constructor(n) {
    this.n = n;
  }
  *[Symbol.iterator]() {
    for (let i = this.n; i > 0; i--) yield i;
  }
}
