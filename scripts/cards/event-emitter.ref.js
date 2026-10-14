class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  on(name, listener) {
    if (!this.events.has(name)) this.events.set(name, []);
    this.events.get(name).push(listener);
  }
  off(name, listener) {
    if (!this.events.has(name)) return;
    this.events.set(
      name,
      this.events.get(name).filter((l) => l !== listener && l.listener !== listener)
    );
  }
  once(name, listener) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      listener(...args);
    };
    wrapper.listener = listener; // lets off(name, listener) remove a once() registration
    this.on(name, wrapper);
  }
  emit(name, ...args) {
    if (!this.events.has(name)) return;
    // Iterate over a snapshot so listeners can unsubscribe during emit without skipping others.
    [...this.events.get(name)].forEach((fn) => fn(...args));
  }
}
