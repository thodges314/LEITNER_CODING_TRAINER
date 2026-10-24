interface AssertionResult {
  pass: boolean;
}

interface Matchers<T = unknown> {
  not: Matchers<T>;
  toBe(expected: unknown): AssertionResult;
  toEqual(expected: unknown): AssertionResult;
  toThrow(expectedError?: string | RegExp): AssertionResult;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, k)) return false;
    if (!deepEqual(objA[k], objB[k])) return false;
  }
  return true;
}

function expect<T>(actual: T): Matchers<T> {
  function createMatchers(isNot: boolean = false): Matchers<T> {
    return {
      get not(): Matchers<T> {
        return createMatchers(!isNot);
      },
      toBe(expected: unknown): AssertionResult {
        const pass = Object.is(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error(`Assertion failed: expected ${actual} ${isNot ? 'not to be' : 'to be'} ${expected}`);
        }
        return { pass: true };
      },
      toEqual(expected: unknown): AssertionResult {
        const pass = deepEqual(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error(`Assertion failed: expected deep equality ${isNot ? 'not to match' : 'to match'}`);
        }
        return { pass: true };
      },
      toThrow(expectedError?: string | RegExp): AssertionResult {
        if (typeof actual !== 'function') {
          throw new Error('actual must be a function to assert toThrow');
        }
        let threw = false;
        let errVal: unknown = null;
        try {
          (actual as () => unknown)();
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
      },
    };
  }

  return createMatchers(false);
}
