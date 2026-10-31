class BackpressurePipe {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 16;
    this.queue = [];
    this.listeners = {};
    this.isPaused = false;
  }

  write(chunk) {
    this.queue.push(chunk);
    if (this.queue.length >= this.highWaterMark) {
      this.isPaused = true;
      return false;
    }
    return true;
  }

  read() {
    if (!this.queue.length) return undefined;
    const chunk = this.queue.shift();
    if (this.isPaused && this.queue.length === 0) {
      this.isPaused = false;
      (this.listeners.drain || []).forEach((fn) => fn());
    }
    return chunk;
  }

  on(event, fn) { (this.listeners[event] ??= []).push(fn); }
  off(event, fn) { this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== fn); }
  get bufferedAmount() { return this.queue.length; }
}

