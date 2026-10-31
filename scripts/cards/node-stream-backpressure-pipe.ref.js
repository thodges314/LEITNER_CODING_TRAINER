class BackpressurePipe {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 16;
    this.queue = [];
    this._needsDrain = false;
    this.listeners = { drain: [] };
  }

  write(chunk) {
    this.queue.push(chunk);
    if (this.queue.length >= this.highWaterMark) {
      this._needsDrain = true;
      return false;
    }
    return true;
  }

  read() {
    if (this.queue.length === 0) return undefined;
    const chunk = this.queue.shift();
    if (this._needsDrain && this.queue.length === 0) {
      this._needsDrain = false;
      const handlers = [...(this.listeners.drain || [])];
      for (const fn of handlers) {
        fn();
      }
    }
    return chunk;
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== fn);
  }

  get bufferedAmount() {
    return this.queue.length;
  }

  get isPaused() {
    return this._needsDrain;
  }
}
