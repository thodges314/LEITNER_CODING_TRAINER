type MockResult<T> =
  | { type: 'return'; value: T }
  | { type: 'throw'; value: unknown };

interface MockState<TArgs extends unknown[] = any[], TReturn = any> {
  calls: TArgs[];
  results: MockResult<TReturn>[];
}

interface MockFunction<TArgs extends unknown[] = any[], TReturn = any> {
  (...args: TArgs): TReturn;
  mock: MockState<TArgs, TReturn>;
  mockReturnValue(val: TReturn): MockFunction<TArgs, TReturn>;
  mockImplementation(fn: (...args: TArgs) => TReturn): MockFunction<TArgs, TReturn>;
  mockClear(): MockFunction<TArgs, TReturn>;
}

function mockFn<TArgs extends unknown[] = any[], TReturn = any>(
  impl?: (...args: TArgs) => TReturn
): MockFunction<TArgs, TReturn> {
  let currentImpl: ((...args: TArgs) => TReturn) | undefined = impl;

  function mock(...args: TArgs): TReturn {
    m.mock.calls.push(args);
    try {
      const res = currentImpl ? currentImpl(...args) : (undefined as unknown as TReturn);
      m.mock.results.push({ type: 'return', value: res });
      return res;
    } catch (err) {
      m.mock.results.push({ type: 'throw', value: err });
      throw err;
    }
  }

  const m = mock as unknown as MockFunction<TArgs, TReturn>;

  m.mock = {
    calls: [],
    results: [],
  };

  m.mockReturnValue = (val: TReturn): MockFunction<TArgs, TReturn> => {
    currentImpl = (): TReturn => val;
    return m;
  };

  m.mockImplementation = (fn: (...args: TArgs) => TReturn): MockFunction<TArgs, TReturn> => {
    currentImpl = fn;
    return m;
  };

  m.mockClear = (): MockFunction<TArgs, TReturn> => {
    m.mock.calls = [];
    m.mock.results = [];
    return m;
  };

  return m;
}
