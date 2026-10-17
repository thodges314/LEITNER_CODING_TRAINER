function createAsyncRange(start, end, delayMs = 0) {
  return {
    [Symbol.asyncIterator]() {
      let cur = start;
      return {
        next() {
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
        }
      };
    }
  };
}

async function collectAsync(asyncIterable) {
  const items = [];
  for await (const x of asyncIterable) {
    items.push(x);
  }
  return items;
}

function mapAsyncIterable(asyncIterable, fn) {
  return {
    [Symbol.asyncIterator]() {
      const iter = asyncIterable[Symbol.asyncIterator]();
      return {
        async next() {
          const res = await iter.next();
          if (res.done) return res;
          return { value: await fn(res.value), done: false };
        }
      };
    }
  };
}
