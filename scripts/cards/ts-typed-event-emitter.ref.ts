class TypedEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Array<(payload: any) => void>>();

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    (this.listeners.get(event) || []).forEach(fn => fn(payload));
  }
}
