function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function delay<T>(value: T, ms: number): Promise<T> {
  return sleep(ms).then(() => value);
}

async function measure(fn: () => any | Promise<any>): Promise<number> {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}
