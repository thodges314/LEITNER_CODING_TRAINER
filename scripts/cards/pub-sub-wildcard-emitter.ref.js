class PubSub {
  constructor() {
    this.subscribers = [];
  }
  _matches(pattern, topic) {
    if (pattern === '*' || pattern === topic) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      const parts = topic.split('.');
      return parts.length === 2 && parts[0] === prefix;
    }
    return false;
  }
  subscribe(pattern, handler) {
    const sub = { pattern, handler };
    this.subscribers.push(sub);
    return () => {
      const idx = this.subscribers.indexOf(sub);
      if (idx !== -1) this.subscribers.splice(idx, 1);
    };
  }
  once(pattern, handler) {
    const unsub = this.subscribe(pattern, (data, topic) => {
      unsub();
      handler(data, topic);
    });
    return unsub;
  }
  publish(topic, data) {
    const matches = this.subscribers.filter((s) => this._matches(s.pattern, topic));
    for (const sub of matches) {
      sub.handler(data, topic);
    }
    return matches.length;
  }
  clear() {
    this.subscribers = [];
  }
}
