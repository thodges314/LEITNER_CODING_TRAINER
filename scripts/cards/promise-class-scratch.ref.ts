type MyPromiseState = 'pending' | 'fulfilled' | 'rejected';
type Executor<T> = (resolve: (value?: any) => void, reject: (reason?: any) => void) => void;

class MyPromise<T = any> {
  state: MyPromiseState = 'pending';
  value: any = undefined;
  callbacks: (() => void)[] = [];

  constructor(executor: Executor<T>) {
    const settle = (state: MyPromiseState, value: any): void => {
      this.state = state;
      this.value = value;
      const pending = this.callbacks;
      this.callbacks = [];
      pending.forEach((cb) => queueMicrotask(cb));
    };

    const resolveValue = (v: any): void => {
      if (v === this) return settle('rejected', new TypeError('Chaining cycle detected for promise'));
      if (v !== null && (typeof v === 'object' || typeof v === 'function')) {
        let then: any;
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
              (y: any) => {
                if (!called) {
                  called = true;
                  resolveValue(y);
                }
              },
              (r: any) => {
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

    let done = false;
    const resolve = (v?: any): void => {
      if (done) return;
      done = true;
      resolveValue(v);
    };
    const reject = (r?: any): void => {
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

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise((resolve, reject) => {
      const run = (): void => {
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

  catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): MyPromise<T | TResult> {
    return this.then(undefined, onRejected);
  }

  finally(fn: () => void): MyPromise<T> {
    return this.then(
      (value) => MyPromise.resolve(fn()).then(() => value),
      (reason) =>
        MyPromise.resolve(fn()).then(() => {
          throw reason;
        })
    );
  }

  static resolve<U>(value?: U | PromiseLike<U>): MyPromise<U> {
    return value instanceof MyPromise ? (value as MyPromise<U>) : new MyPromise<U>((resolve) => resolve(value));
  }

  static reject<U = never>(reason?: any): MyPromise<U> {
    return new MyPromise<U>((_, reject) => reject(reason));
  }
}
