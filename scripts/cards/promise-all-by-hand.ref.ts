function myAll<T>(items: (T | Promise<T>)[]): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const results = new Array<T>(items.length);
    let remaining = items.length;
    if (remaining === 0) {
      resolve(results);
      return;
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        remaining--;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}
