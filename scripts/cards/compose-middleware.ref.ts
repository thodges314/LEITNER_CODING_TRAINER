type NextFn = () => Promise<any>;
type MiddlewareFn<T = any> = (ctx: T, next: NextFn) => any;

function compose<T = any>(fns: MiddlewareFn<T>[]): (ctx: T) => Promise<any> {
  return function run(ctx: T): Promise<any> {
    const dispatch = (i: number): Promise<any> => {
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
