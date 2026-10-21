class AsyncQueue {
  private queue: Promise<any> = Promise.resolve();

  add<T>(task: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(() => Promise.resolve().then(task).then(resolve, reject));
    });
  }
}
