interface AssertionSuite {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  throws(fn: () => void, expectedError?: string | RegExp): void;
}

function createAssert(): AssertionSuite {
  return {
    ok(value: unknown, message?: string): void {
      if (!value) {
        throw new Error(message || 'Expected truthy value');
      }
    },

    equal(actual: unknown, expected: unknown, message?: string): void {
      if (!Object.is(actual, expected)) {
        throw new Error(message || 'Values are not equal');
      }
    },

    throws(fn: () => void, expectedError?: string | RegExp): void {
      let threw = false;
      let caughtError: unknown;

      try {
        fn();
      } catch (err: unknown) {
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
