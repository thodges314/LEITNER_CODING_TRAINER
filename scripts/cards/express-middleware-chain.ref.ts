type Middleware = (req: any, res: any, next: (err?: any) => void) => any;
type ErrorMiddleware = (err: any, req: any, res: any, next: (err?: any) => void) => any;

class MiddlewarePipeline {
  stack: (Middleware | ErrorMiddleware)[] = [];

  use(fn: Middleware | ErrorMiddleware): this {
    this.stack.push(fn);
    return this;
  }

  handle(req: any, res: any): void {
    let index = -1;
    const dispatch = (i: number, err?: any): void => {
      if (i <= index) return;
      index = i;
      const layer = this.stack[i];
      if (!layer) {
        if (err) {
          res.statusCode = 500;
          if (typeof res.end === 'function') res.end('Internal Server Error');
        }
        return;
      }
      const isErrorHandler = layer.length === 4;
      if (Boolean(err) !== isErrorHandler) return dispatch(i + 1, err);
      const next = (e?: any): void => dispatch(i + 1, e);
      try {
        const out = isErrorHandler
          ? (layer as ErrorMiddleware)(err, req, res, next)
          : (layer as Middleware)(req, res, next);
        if (out && typeof out.then === 'function') out.catch(next);
      } catch (e) {
        next(e);
      }
    };
    dispatch(0);
  }
}
