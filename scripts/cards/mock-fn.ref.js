function mockFn(impl) {
  let currentImpl = impl;

  function mock(...args) {
    mock.mock.calls.push(args);
    try {
      const res = currentImpl ? currentImpl(...args) : undefined;
      mock.mock.results.push({ type: 'return', value: res });
      return res;
    } catch (err) {
      mock.mock.results.push({ type: 'throw', value: err });
      throw err;
    }
  }

  mock.mock = {
    calls: [],
    results: []
  };

  mock.mockReturnValue = (val) => {
    currentImpl = () => val;
    return mock;
  };

  mock.mockImplementation = (fn) => {
    currentImpl = fn;
    return mock;
  };

  mock.mockClear = () => {
    mock.mock.calls = [];
    mock.mock.results = [];
    return mock;
  };

  return mock;
}
