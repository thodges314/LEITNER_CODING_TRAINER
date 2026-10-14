function createCounter({ start = 0, step = 1 } = {}) {
  let count = start; // private: only reachable through the returned functions
  return {
    increment() {
      count += step;
    },
    decrement() {
      count -= step;
    },
    reset() {
      count = start;
    },
    value() {
      return count;
    },
  };
}

function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function makeAdders(n) {
  const adders = [];
  for (let i = 0; i < n; i++) {
    adders.push((x) => x + i); // `let` gives every iteration its own i
  }
  return adders;
}
