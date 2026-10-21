function orderOfEvents(): Promise<string[]> {
  const log: string[] = [];
  return new Promise<string[]>((resolve) => {
    log.push('start');
    setTimeout(() => {
      log.push('timeout');
      resolve(log);
    }, 0);
    Promise.resolve().then(() => log.push('promise'));
    log.push('end');
  });
}

async function asyncOrder(): Promise<string[]> {
  const log: string[] = [];
  async function f(l: string[]): Promise<void> {
    l.push('f1');
    await null;
    l.push('f2');
  }
  log.push('before');
  const p = f(log);
  log.push('after');
  await p;
  return log;
}
