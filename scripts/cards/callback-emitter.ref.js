function createEmitter() {
  const listeners = {};
  return {
    on(event, fn) {
      (listeners[event] ||= []).push(fn);
    },
    emit(event, ...args) {
      const list = listeners[event] || [];
      list.forEach((fn) => fn(...args));
      return list.length;
    },
  };
}
