interface SpyCall {
  args: unknown[];
  returned?: unknown;
  threw?: unknown;
}

interface MockSpy<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
  calls: SpyCall[];
  callCount: number;
  mockReturnValue(val: TReturn): MockSpy<TArgs, TReturn>;
  mockImplementation(fn: (...args: TArgs) => TReturn): MockSpy<TArgs, TReturn>;
  mockReset(): void;
}

function createSpy<TArgs extends unknown[] = unknown[], TReturn = unknown>(
  implementation?: (...args: TArgs) => TReturn
): MockSpy<TArgs, TReturn> {
  let currentImpl: ((...args: TArgs) => TReturn) | undefined =
    typeof implementation === 'function' ? implementation : undefined;

  const spy = function (...args: TArgs): TReturn {
    spy.callCount++;
    const callRecord: SpyCall = { args: [...args] };
    spy.calls.push(callRecord);

    if (currentImpl) {
      try {
        const result = currentImpl(...args);
        callRecord.returned = result;
        return result;
      } catch (err) {
        callRecord.threw = err;
        throw err;
      }
    }
    callRecord.returned = undefined;
    return undefined as unknown as TReturn;
  } as MockSpy<TArgs, TReturn>;

  spy.calls = [];
  spy.callCount = 0;

  spy.mockReturnValue = function (val: TReturn): MockSpy<TArgs, TReturn> {
    currentImpl = () => val;
    return spy;
  };

  spy.mockImplementation = function (fn: (...args: TArgs) => TReturn): MockSpy<TArgs, TReturn> {
    currentImpl = typeof fn === 'function' ? fn : undefined;
    return spy;
  };

  spy.mockReset = function (): void {
    spy.calls.length = 0;
    spy.callCount = 0;
  };

  return spy;
}

