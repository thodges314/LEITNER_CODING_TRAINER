class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(event, fn) {
    (this._events[event] ??= []).push(fn);
    return this;
  }

  prependListener(event, fn) {
    (this._events[event] ??= []).unshift(fn);
    return this;
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn.apply(this, args);
    };
    wrapper.original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    const list = this._events[event];
    if (list) {
      const idx = list.findIndex((h) => h === fn || h.original === fn);
      if (idx !== -1) list.splice(idx, 1);
    }
    return this;
  }

  emit(event, ...args) {
    const list = this._events[event];
    if (event === 'error' && (!list || !list.length)) {
      throw args[0] instanceof Error ? args[0] : new Error(String(args[0]));
    }
    if (!list || !list.length) return false;
    [...list].forEach((fn) => fn.apply(this, args));
    return true;
  }

  listenerCount(event) {
    return this._events[event]?.length || 0;
  }
}

