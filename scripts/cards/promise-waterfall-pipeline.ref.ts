function promiseWaterfall<T = any>(
  stages: Array<(value: any) => any>,
  initialValue: any
): Promise<T> {
  return stages.reduce(
    (chain, stage) => chain.then((val) => stage(val)),
    Promise.resolve(initialValue)
  );
}

