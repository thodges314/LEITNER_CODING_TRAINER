type EventListener = (...args: any[]) => void;

interface WrappedListener extends EventListener {
  original?: EventListener;
}

class EventEmitter {
  private _events: Record<string, WrappedListener[]>;

  constructor() {
    this._events = Object.create(null);
  }

  on(event: string, listener: EventListener): this {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }

  prependListener(event: string, listener: EventListener): this {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
    if (!this._events[event]) this._events[event] = [];
    this._events[event].unshift(listener);
    return this;
  }

  once(event: string, listener: EventListener): this {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
    const wrapper: WrappedListener = (...args: any[]) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    wrapper.original = listener;
    return this.on(event, wrapper);
  }

  off(event: string, listener: EventListener): this {
    const list = this._events[event];
    if (!list || list.length === 0) return this;
    const idx = list.findIndex((fn) => fn === listener || fn.original === listener);
    if (idx !== -1) {
      list.splice(idx, 1);
      if (list.length === 0) delete this._events[event];
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (event === 'error') {
      const list = this._events['error'];
      if (!list || list.length === 0) {
        const err = args[0] instanceof Error ? args[0] : new Error(args[0] ? String(args[0]) : 'Unhandled error');
        throw err;
      }
    }
    const list = this._events[event];
    if (!list || list.length === 0) return false;
    const copy = list.slice();
    for (const fn of copy) {
      fn.apply(this, args);
    }
    return true;
  }

  listenerCount(event: string): number {
    const list = this._events[event];
    return list ? list.length : 0;
  }
}
