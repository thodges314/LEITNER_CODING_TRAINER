function createSecureBridge(options) {
  const {
    targetWindow,
    listenWindow = window,
    targetOrigin,
    allowedOrigins,
    channel = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
    requireSourceMatch = false,
    onMessage,
  } = options;

  const allowedSet = new Set(allowedOrigins);
  let destroyed = false;

  const handleMessage = (event) => {
    if (destroyed) return;
    if (!allowedSet.has(event.origin)) return;
    if (requireSourceMatch && event.source !== targetWindow) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.__channel !== channel || typeof data.type !== 'string') return;

    if (typeof onMessage === 'function') {
      onMessage(data.type, data.payload, event.origin);
    }
  };

  listenWindow.addEventListener('message', handleMessage);

  return {
    send(type, payload) {
      if (destroyed) return;
      targetWindow.postMessage({ __channel: channel, type, payload }, targetOrigin);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listenWindow.removeEventListener('message', handleMessage);
    },
    getChannel() {
      return channel;
    },
  };
}

