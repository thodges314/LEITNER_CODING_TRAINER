function compose(fns) {
  return function run(ctx) {
    const dispatch = (i) => {
      const fn = fns[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0);
  };
}
