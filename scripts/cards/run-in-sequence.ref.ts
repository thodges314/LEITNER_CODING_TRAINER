async function runSequentially<T>(tasks: (() => T | Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

function runInParallel<T>(tasks: (() => T | Promise<T>)[]): Promise<T[]> {
  return Promise.all(tasks.map((task) => task()));
}
