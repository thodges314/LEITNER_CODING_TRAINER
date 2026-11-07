const registry = new Map();

function createMatchers(actual, isNot = false) {
  const matchers = {
    get not() {
      return createMatchers(actual, !isNot);
    },

    toBe(expected) {
      const same = Object.is(actual, expected);
      const pass = isNot ? !same : same;
      if (!pass) {
        throw new Error(
          isNot
            ? `Expected value not to be: ${expected}`
            : `Expected ${expected} but received ${actual}`
        );
      }
      return { pass: true };
    },
  };

  for (const [name, fn] of registry.entries()) {
    matchers[name] = (...args) => {
      const context = { isNot };
      const result = fn.call(context, actual, ...args);
      const pass = isNot ? !result.pass : Boolean(result.pass);
      if (!pass) {
        const msg = typeof result.message === 'function' ? result.message() : 'Assertion failed';
        throw new Error(msg);
      }
      return { pass: true };
    };
  }

  return matchers;
}

function expect(actual) {
  return createMatchers(actual, false);
}

expect.extend = function extend(customMatchers) {
  if (!customMatchers || typeof customMatchers !== 'object') return;
  for (const [name, fn] of Object.entries(customMatchers)) {
    if (typeof fn === 'function') {
      registry.set(name, fn);
    }
  }
};

