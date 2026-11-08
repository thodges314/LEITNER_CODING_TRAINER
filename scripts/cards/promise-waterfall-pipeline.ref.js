function promiseWaterfall(stages, initialValue) {
  return stages.reduce(
    (chain, stage) => chain.then((val) => stage(val)),
    Promise.resolve(initialValue)
  );
}

