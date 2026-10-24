type EventListener = ((...args: unknown[]) => void) & {
  listener?: (...args: unknown[]) => void;
};

class EventEmitter {
  private events: Map<string, EventListener[]>;

  constructor() {
    this.events = new Map();
  }

  on(name: string, listener: EventListener): void {
    if (!this.events.has(name)) this.events.set(name, []);
    this.events.get(name)!.push(listener);
  }

  off(name: string, listener: EventListener): void {
    if (!this.events.has(name)) return;
    this.events.set(
      name,
      this.events.get(name)!.filter((l) => l !== listener && l.listener !== listener)
    );
  }

  once(name: string, listener: EventListener): void {
    const wrapper: EventListener = (...args: unknown[]) => {
      this.off(name, wrapper);
      listener(...args);
    };
    wrapper.listener = listener;
    this.on(name, wrapper);
  }

  emit(name: string, ...args: unknown[]): void {
    if (!this.events.has(name)) return;
    [...this.events.get(name)!].forEach((fn) => fn(...args));
  }
}
