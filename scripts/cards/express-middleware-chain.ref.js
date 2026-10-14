class MiddlewarePipeline {
  constructor() {
    this.stack = [];
  }
  use(fn) {
    this.stack.push(fn);
    return this;
  }
  handle(req, res) {
    let index = -1;
    const dispatch = (i, err) => {
      if (i <= index) return; // next() called twice from the same layer: ignore
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
      // Errors only reach error handlers; normal requests skip error handlers.
      if (Boolean(err) !== isErrorHandler) return dispatch(i + 1, err);
      const next = (e) => dispatch(i + 1, e);
      try {
        const out = isErrorHandler ? layer(err, req, res, next) : layer(req, res, next);
        if (out && typeof out.then === 'function') out.catch(next);
      } catch (e) {
        next(e);
      }
    };
    dispatch(0);
  }
}
