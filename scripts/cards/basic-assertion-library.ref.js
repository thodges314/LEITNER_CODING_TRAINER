function createAssert() {
  return {
    ok(value, message) {
      if (!value) {
        throw new Error(message || 'Expected truthy value');
      }
    },

    equal(actual, expected, message) {
      if (!Object.is(actual, expected)) {
        throw new Error(message || 'Values are not equal');
      }
    },

    throws(fn, expectedError) {
      let threw = false;
      let caughtError;

      try {
        fn();
      } catch (err) {
        threw = true;
        caughtError = err;
      }

      if (!threw) {
        throw new Error('Expected function to throw');
      }

      if (expectedError !== undefined) {
        const msg = caughtError instanceof Error ? caughtError.message : String(caughtError);
        if (typeof expectedError === 'string') {
          if (!msg.includes(expectedError)) {
            throw new Error('Error message did not match string');
          }
        } else if (expectedError instanceof RegExp) {
          if (!expectedError.test(msg)) {
            throw new Error('Error message did not match pattern');
          }
        }
      }
    },
  };
}
