interface BackpressurePipeOptions {
  highWaterMark?: number;
}

type DrainListener = () => void;

class BackpressurePipe {
  public highWaterMark: number;
  private queue: any[];
  private _needsDrain: boolean;
  private listeners: Record<string, DrainListener[]>;

  constructor(options: BackpressurePipeOptions = {}) {
    this.highWaterMark = options.highWaterMark || 16;
    this.queue = [];
    this._needsDrain = false;
    this.listeners = { drain: [] };
  }

  write(chunk: any): boolean {
    this.queue.push(chunk);
    if (this.queue.length >= this.highWaterMark) {
      this._needsDrain = true;
      return false;
    }
    return true;
  }

  read(): any | undefined {
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

  on(event: 'drain', fn: DrainListener): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: 'drain', fn: DrainListener): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== fn);
  }

  get bufferedAmount(): number {
    return this.queue.length;
  }

  get isPaused(): boolean {
    return this._needsDrain;
  }
}
