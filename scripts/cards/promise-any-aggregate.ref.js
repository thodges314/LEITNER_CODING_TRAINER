function promiseAny(promises) {
  const items = Array.from(promises);
  if (items.length === 0) {
    const err = typeof AggregateError !== 'undefined'
      ? new AggregateError([], 'All promises were rejected')
      : Object.assign(new Error('All promises were rejected'), { name: 'AggregateError', errors: [] });
    return Promise.reject(err);
  }
  return new Promise((resolve, reject) => {
    const errors = new Array(items.length);
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
