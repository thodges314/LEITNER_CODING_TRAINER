async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

function runInParallel(tasks) {
  return Promise.all(tasks.map((task) => task()));
}
