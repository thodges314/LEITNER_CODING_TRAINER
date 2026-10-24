type ListenerFn = (...args: unknown[]) => void;

interface Emitter {
  on(event: string, fn: ListenerFn): void;
  emit(event: string, ...args: unknown[]): number;
}

function createEmitter(): Emitter {
  const listeners: Record<string, ListenerFn[]> = {};
  return {
    on(event: string, fn: ListenerFn): void {
      (listeners[event] ||= []).push(fn);
    },
    emit(event: string, ...args: unknown[]): number {
      const list = listeners[event] || [];
      list.forEach((fn) => fn(...args));
      return list.length;
    },
  };
}
