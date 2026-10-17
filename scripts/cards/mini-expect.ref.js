function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

function expect(actual) {
  function createMatchers(isNot = false) {
    return {
      get not() {
        return createMatchers(!isNot);
      },
      toBe(expected) {
        const pass = Object.is(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error(`Assertion failed: expected ${actual} ${isNot ? 'not to be' : 'to be'} ${expected}`);
        }
        return { pass: true };
      },
      toEqual(expected) {
        const pass = deepEqual(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error(`Assertion failed: expected deep equality ${isNot ? 'not to match' : 'to match'}`);
        }
        return { pass: true };
      },
      toThrow(expectedError) {
        if (typeof actual !== 'function') {
          throw new Error('actual must be a function to assert toThrow');
        }
        let threw = false;
        let errVal = null;
        try {
          actual();
        } catch (e) {
          threw = true;
          errVal = e;
        }

        let match = threw;
        if (threw && expectedError !== undefined) {
          const msg = errVal instanceof Error ? errVal.message : String(errVal);
          if (expectedError instanceof RegExp) {
            match = expectedError.test(msg);
          } else if (typeof expectedError === 'string') {
            match = msg.includes(expectedError);
          }
        }

        if (isNot ? match : !match) {
          throw new Error(`Assertion failed: expected function ${isNot ? 'not to throw' : 'to throw'}`);
        }
        return { pass: true };
      }
    };
  }

  return createMatchers(false);
}
