interface CancelableResult<T> {
  promise: Promise<T>;
  cancel: () => void;
}

function makeCancelable<T>(promise: Promise<T>): CancelableResult<T> {
  let hasCanceled = false;
  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
      (err) => (hasCanceled ? reject({ isCanceled: true }) : reject(err))
    );
  });
  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    }
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutError: Error = new Error('Timeout')): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(timeoutError), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}
