type SpyResult<T> =
  | { type: 'return'; value: T }
  | { type: 'throw'; value: unknown };

interface Spy<TArgs extends unknown[] = any[], TReturn = any> {
  (...args: TArgs): TReturn;
  calls: TArgs[];
  results: SpyResult<TReturn>[];
  calledWith(...args: unknown[]): boolean;
  reset(): void;
}

function createSpy<TArgs extends unknown[] = any[], TReturn = any>(
  impl?: (...args: TArgs) => TReturn
): Spy<TArgs, TReturn> {
  function spy(this: unknown, ...args: TArgs): TReturn {
    (spy as unknown as Spy<TArgs, TReturn>).calls.push(args);
    try {
      const value = impl ? impl.apply(this, args) : (undefined as unknown as TReturn);
      (spy as unknown as Spy<TArgs, TReturn>).results.push({ type: 'return', value });
      return value;
    } catch (error) {
      (spy as unknown as Spy<TArgs, TReturn>).results.push({ type: 'throw', value: error });
      throw error;
    }
  }

  const s = spy as unknown as Spy<TArgs, TReturn>;
  s.calls = [];
  s.results = [];
  s.calledWith = (...args: unknown[]): boolean =>
    s.calls.some((call) => call.length === args.length && call.every((arg, i) => Object.is(arg, args[i])));
  s.reset = (): void => {
    s.calls.length = 0;
    s.results.length = 0;
  };
  return s;
}
