function createSpy(impl) {
  function spy(...args) {
    spy.calls.push(args);
    try {
      const value = impl ? impl.apply(this, args) : undefined;
      spy.results.push({ type: 'return', value });
      return value;
    } catch (error) {
      spy.results.push({ type: 'throw', value: error });
      throw error;
    }
  }

  spy.calls = [];
  spy.results = [];
  spy.calledWith = (...args) =>
    spy.calls.some((call) => call.length === args.length && call.every((arg, i) => Object.is(arg, args[i])));
  spy.reset = () => {
    spy.calls.length = 0;
    spy.results.length = 0;
  };
  return spy;
}
