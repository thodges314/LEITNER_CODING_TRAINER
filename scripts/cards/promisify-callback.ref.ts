function promisify<T = any>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return function (this: any, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        fn.call(this, ...args, (err: any, result: T) => {
          if (err) reject(err);
          else resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    });
  };
}
