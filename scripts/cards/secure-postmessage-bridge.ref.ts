interface PostMessageTarget {
  postMessage(message: unknown, targetOrigin: string): void;
}

interface PostMessageReceiver {
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
  removeEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
}

interface SecureBridgeOptions {
  targetWindow: PostMessageTarget;
  listenWindow?: PostMessageReceiver;
  targetOrigin: string;
  allowedOrigins: string[];
  channel?: string;
  requireSourceMatch?: boolean;
  onMessage?: (type: string, payload: unknown, origin: string) => void;
}

interface SecureBridge {
  send(type: string, payload?: unknown): void;
  destroy(): void;
  getChannel(): string;
}

function createSecureBridge(options: SecureBridgeOptions): SecureBridge {
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

  const handleMessage = (event: MessageEvent): void => {
    if (destroyed) return;
    if (!allowedSet.has(event.origin)) return;
    if (requireSourceMatch && (event.source as unknown) !== targetWindow) return;

    const data = event.data as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') return;
    if (data.__channel !== channel || typeof data.type !== 'string') return;

    if (typeof onMessage === 'function') {
      onMessage(data.type, data.payload, event.origin);
    }
  };

  listenWindow.addEventListener('message', handleMessage);

  return {
    send(type: string, payload?: unknown): void {
      if (destroyed) return;
      targetWindow.postMessage({ __channel: channel, type, payload }, targetOrigin);
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      listenWindow.removeEventListener('message', handleMessage);
    },
    getChannel(): string {
      return channel;
    },
  };
}

