function promiseAny<T>(promises: Iterable<T | Promise<T>>): Promise<T> {
  const items = Array.from(promises);
  if (items.length === 0) {
    const err = typeof AggregateError !== 'undefined'
      ? new AggregateError([], 'All promises were rejected')
      : Object.assign(new Error('All promises were rejected'), { name: 'AggregateError', errors: [] });
    return Promise.reject(err);
  }
  return new Promise<T>((resolve, reject) => {
    const errors = new Array<any>(items.length);
    let rejectedCount = 0;
    items.forEach((p, index) => {
      Promise.resolve(p).then(
        (val) => resolve(val),
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === items.length) {
            const err = typeof AggregateError !== 'undefined'
              ? new AggregateError(errors, 'All promises were rejected')
              : Object.assign(new Error('All promises were rejected'), { name: 'AggregateError', errors });
            reject(err);
          }
        }
      );
    });
  });
}
