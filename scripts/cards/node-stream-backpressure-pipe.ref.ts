type DrainListener = () => void;

class BackpressurePipe {
  public highWaterMark: number;
  private queue: any[] = [];
  public isPaused = false;
  private listeners: Record<string, DrainListener[]> = {};

  constructor(options: BackpressurePipeOptions = {}) {
    this.highWaterMark = options.highWaterMark || 16;
  }

  write(chunk: any): boolean {
    this.queue.push(chunk);
    if (this.queue.length >= this.highWaterMark) {
      this.isPaused = true;
      return false;
    }
    return true;
  }

  read(): any | undefined {
    if (!this.queue.length) return undefined;
    const chunk = this.queue.shift();
    if (this.isPaused && this.queue.length === 0) {
      this.isPaused = false;
      (this.listeners.drain || []).forEach((fn) => fn());
    }
    return chunk;
  }

  on(event: 'drain', fn: DrainListener): void { (this.listeners[event] ??= []).push(fn); }
  off(event: 'drain', fn: DrainListener): void { this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== fn); }
  get bufferedAmount(): number { return this.queue.length; }
}

