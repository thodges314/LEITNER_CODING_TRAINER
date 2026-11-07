const runSequentially = async (tasks) => {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

const runInParallel = (tasks) => {
  return Promise.all(tasks.map((task) => task()));
}
