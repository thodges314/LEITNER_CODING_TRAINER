class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];

    const settle = (state, value) => {
      this.state = state;
      this.value = value;
      const pending = this.callbacks;
      this.callbacks = [];
      pending.forEach((cb) => queueMicrotask(cb));
    };

    // The promise resolution procedure: adopt thenables, reject on a cycle.
    const resolveValue = (v) => {
      if (v === this) return settle('rejected', new TypeError('Chaining cycle detected for promise'));
      if (v !== null && (typeof v === 'object' || typeof v === 'function')) {
        let then;
        try {
          then = v.then;
        } catch (e) {
          return settle('rejected', e);
        }
        if (typeof then === 'function') {
          let called = false;
          try {
            then.call(
              v,
              (y) => {
                if (!called) {
                  called = true;
                  resolveValue(y);
                }
              },
              (r) => {
                if (!called) {
                  called = true;
                  settle('rejected', r);
                }
              }
            );
          } catch (e) {
            if (!called) {
              called = true;
              settle('rejected', e);
            }
          }
          return;
        }
      }
      settle('fulfilled', v);
    };

    let done = false; // only the first resolve/reject call counts
    const resolve = (v) => {
      if (done) return;
      done = true;
      resolveValue(v);
    };
    const reject = (r) => {
      if (done) return;
      done = true;
      settle('rejected', r);
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const run = () => {
        const handler = this.state === 'fulfilled' ? onFulfilled : onRejected;
        if (typeof handler !== 'function') {
          return this.state === 'fulfilled' ? resolve(this.value) : reject(this.value);
        }
        try {
          resolve(handler(this.value));
        } catch (e) {
          reject(e);
        }
      };
      if (this.state === 'pending') this.callbacks.push(run);
      else queueMicrotask(run);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(fn) {
    return this.then(
      (value) => MyPromise.resolve(fn()).then(() => value),
      (reason) =>
        MyPromise.resolve(fn()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    return value instanceof MyPromise ? value : new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}
