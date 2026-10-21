function promiseAll<T>(iterable: Iterable<T | Promise<T>>): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const items = Array.from(iterable);
    if (items.length === 0) return resolve([]);
    const results = new Array<T>(items.length);
    let completed = 0;
    items.forEach((item, i) => {
      Promise.resolve(item).then((val) => {
        results[i] = val;
        if (++completed === items.length) resolve(results);
      }, reject);
    });
  });
}

function promiseAllSettled<T>(iterable: Iterable<T | Promise<T>>): Promise<PromiseSettledResult<T>[]> {
  return promiseAll(
    Array.from(iterable, (item) =>
      Promise.resolve(item).then(
        (value): PromiseSettledResult<T> => ({ status: 'fulfilled', value }),
        (reason): PromiseSettledResult<T> => ({ status: 'rejected', reason })
      )
    )
  );
}

function promiseRace<T>(iterable: Iterable<T | Promise<T>>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    for (const item of iterable) Promise.resolve(item).then(resolve, reject);
  });
}
