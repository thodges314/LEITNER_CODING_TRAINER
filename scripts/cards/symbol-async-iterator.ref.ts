function createAsyncRange(start: number, end: number, delayMs = 0): AsyncIterable<number> {
  return {
    [Symbol.asyncIterator]() {
      let cur = start;
      return {
        next(): Promise<IteratorResult<number>> {
          if (cur >= end) {
            return Promise.resolve({ value: undefined, done: true });
          }
          const val = cur++;
          if (delayMs > 0) {
            return new Promise((resolve) =>
              setTimeout(() => resolve({ value: val, done: false }), delayMs)
            );
          }
          return Promise.resolve({ value: val, done: false });
        },
      };
    },
  };
}

async function collectAsync<T>(asyncIterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const x of asyncIterable) {
    items.push(x);
  }
  return items;
}

function mapAsyncIterable<T, U>(
  asyncIterable: AsyncIterable<T>,
  fn: (item: T) => U | Promise<U>
): AsyncIterable<U> {
  return {
    [Symbol.asyncIterator]() {
      const iter = asyncIterable[Symbol.asyncIterator]();
      return {
        async next(): Promise<IteratorResult<U>> {
          const res = await iter.next();
          if (res.done) return { value: undefined, done: true };
          return { value: await fn(res.value), done: false };
        },
      };
    },
  };
}
