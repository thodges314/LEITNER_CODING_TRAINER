function orderOfEvents() {
  const log = [];
  return new Promise((resolve) => {
    log.push('start');
    setTimeout(() => {
      log.push('timeout');
      resolve(log);
    }, 0);
    Promise.resolve().then(() => log.push('promise'));
    log.push('end');
  });
}

async function asyncOrder() {
  const log = [];
  async function f(log) {
    log.push('f1');
    await null;
    log.push('f2');
  }
  log.push('before');
  const p = f(log);
  log.push('after');
  await p;
  return log;
}
