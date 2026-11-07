const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const delay = (value, ms) => {
  return sleep(ms).then(() => value);
};

const measure = async (fn) => {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}
