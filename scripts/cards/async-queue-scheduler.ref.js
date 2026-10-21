class AsyncQueue {
  constructor() {
    this.queue = Promise.resolve();
  }
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(() => Promise.resolve().then(task).then(resolve, reject));
    });
  }
}
