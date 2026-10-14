function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delay(value, ms) {
  return sleep(ms).then(() => value);
}

async function measure(fn) {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}
