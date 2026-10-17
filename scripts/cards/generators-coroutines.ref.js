function* createEchoGenerator() {
  let val = yield 'ready';
  while (true) {
    val = yield [val, typeof val];
  }
}

function runCoroutine(generatorFn, ...args) {
  const it = generatorFn(...args);
  return new Promise((resolve, reject) => {
    function step(method, arg) {
      let res;
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
