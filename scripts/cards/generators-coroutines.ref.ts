function* createEchoGenerator(): Generator<'ready' | [unknown, string], void, unknown> {
  let val: unknown = yield 'ready';
  while (true) {
    val = yield [val, typeof val];
  }
}

function runCoroutine<T = unknown>(
  generatorFn: (...args: any[]) => Generator<any, T, any>,
  ...args: any[]
): Promise<T> {
  const it = generatorFn(...args);
  return new Promise<T>((resolve, reject) => {
    function step(method: 'next' | 'throw', arg?: any) {
      let res: IteratorResult<any, T>;
      try {
        res = it[method](arg);
      } catch (err) {
        return reject(err);
      }
      if (res.done) {
        return resolve(res.value);
      }
      Promise.resolve(res.value).then(
        (val) => step('next', val),
        (err) => step('throw', err)
      );
    }
    step('next');
  });
}
