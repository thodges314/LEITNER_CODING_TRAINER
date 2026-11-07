interface MatcherContext {
  isNot: boolean;
}

interface MatcherResult {
  pass: boolean;
  message: () => string;
}

type MatcherFn = (this: MatcherContext, received: any, ...args: any[]) => MatcherResult;

interface AssertionResult {
  pass: boolean;
}

interface Matchers<T = unknown> {
  not: Matchers<T>;
  toBe(expected: unknown): AssertionResult;
  [customMatcher: string]: any;
}

interface ExpectFunction {
  <T>(actual: T): Matchers<T>;
  extend(customMatchers: Record<string, MatcherFn>): void;
}

const registry = new Map<string, MatcherFn>();

function createMatchers<T>(actual: T, isNot = false): Matchers<T> {
  const matchers: Matchers<T> = {
    get not() {
      return createMatchers(actual, !isNot);
    },

    toBe(expected: unknown): AssertionResult {
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
    matchers[name] = (...args: any[]): AssertionResult => {
      const context: MatcherContext = { isNot };
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

const expect: ExpectFunction = Object.assign(
  function <T>(actual: T): Matchers<T> {
    return createMatchers(actual, false);
  },
  {
    extend(customMatchers: Record<string, MatcherFn>): void {
      if (!customMatchers || typeof customMatchers !== 'object') return;
      for (const [name, fn] of Object.entries(customMatchers)) {
        if (typeof fn === 'function') {
          registry.set(name, fn);
        }
      }
    },
  }
);

