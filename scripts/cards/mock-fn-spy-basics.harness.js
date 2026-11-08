await (async () => {
  const factory = typeof createSpy === 'function' ? createSpy : (globalThis as any).createSpy;

  const case1 = 'Tracks callCount, arguments, and return values in calls array';
  const case2 = 'Propagates thrown exceptions and records error in call history';
  const case3 = 'mockReturnValue overrides return value and returns spy for chaining';
  const case4 = 'mockReset clears calls history and resets callCount to 0';

  if (typeof factory !== 'function') {
    $test.check(case1, false, { error: 'createSpy is not defined' });
    $test.check(case2, false, { error: 'createSpy is not defined' });
    $test.check(case3, false, { error: 'createSpy is not defined' });
    $test.check(case4, false, { error: 'createSpy is not defined' });
    return;
  }

  // Case 1: Tracks calls and return value
  const addSpy = factory((a: number, b: number) => a + b);
  const res1A = addSpy(2, 3);
  const res1B = addSpy(10, 20);

  $test.check(
    case1,
    res1A === 5 &&
      res1B === 30 &&
      addSpy.callCount === 2 &&
      addSpy.calls.length === 2 &&
      addSpy.calls[0].args[0] === 2 &&
      addSpy.calls[0].args[1] === 3 &&
      addSpy.calls[0].returned === 5 &&
      addSpy.calls[1].returned === 30,
    { callCount: addSpy.callCount, calls: addSpy.calls }
  );

  // Case 2: Catches exceptions in history and rethrows
  const throwSpy = factory(() => {
    throw new Error('Boom');
  });

  let caught = false;
  try {
    throwSpy('param1');
  } catch (err: any) {
    caught = err && err.message === 'Boom';
  }

  $test.check(
    case2,
    caught &&
      throwSpy.callCount === 1 &&
      throwSpy.calls.length === 1 &&
      throwSpy.calls[0].threw instanceof Error,
    { caught, threw: throwSpy.calls[0]?.threw }
  );

  // Case 3: mockReturnValue overrides and chains
  const mockSpy = factory();
  const chained = mockSpy.mockReturnValue(42);
  const res3A = mockSpy('first');
  const res3B = mockSpy('second');

  $test.check(
    case3,
    chained === mockSpy && res3A === 42 && res3B === 42 && mockSpy.callCount === 2,
    { res3A, res3B, callCount: mockSpy.callCount }
  );

  // Case 4: mockReset resets state
  mockSpy.mockReset();
  $test.check(
    case4,
    mockSpy.callCount === 0 && mockSpy.calls.length === 0,
    { callCount: mockSpy.callCount, callsLength: mockSpy.calls.length }
  );
})();

