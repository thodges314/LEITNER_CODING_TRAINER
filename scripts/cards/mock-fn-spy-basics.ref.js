function createSpy(implementation) {
  let currentImpl = typeof implementation === 'function' ? implementation : undefined;

  function spy(...args) {
    spy.callCount++;
    const callRecord = { args: [...args] };
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
    return undefined;
  }

  spy.calls = [];
  spy.callCount = 0;

  spy.mockReturnValue = function (val) {
    currentImpl = () => val;
    return spy;
  };

  spy.mockImplementation = function (fn) {
    currentImpl = typeof fn === 'function' ? fn : undefined;
    return spy;
  };

  spy.mockReset = function () {
    spy.calls.length = 0;
    spy.callCount = 0;
  };

  return spy;
}

