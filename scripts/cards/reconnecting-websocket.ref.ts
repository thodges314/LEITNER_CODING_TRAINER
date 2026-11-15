interface SocketLike {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: 'open' | 'message' | 'close' | 'error', listener: (event: any) => void): void;
  removeEventListener(type: 'open' | 'message' | 'close' | 'error', listener: (event: any) => void): void;
}

interface ReconnectSocketOptions {
  createSocket?: (url: string) => SocketLike;
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxRetries?: number;
  jitter?: number;
  onOpen?: () => void;
  onMessage?: (event: any) => void;
  onClose?: (event: any) => void;
  onReconnect?: (attempt: number, delayMs: number) => void;
}

interface ReconnectingSocket {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  getReadyState(): number;
  getQueuedCount(): number;
}

function createReconnectingWebSocket(
  url: string,
  options: ReconnectSocketOptions = {}
): ReconnectingSocket {
  const {
    createSocket = (targetUrl: string) => new WebSocket(targetUrl) as unknown as SocketLike,
    baseDelayMs = 100,
    maxDelayMs = 5000,
    maxRetries = Infinity,
    jitter = 0,
    onOpen,
    onMessage,
    onClose,
    onReconnect,
  } = options;

  let activeSocket: SocketLike | null = null;
  let retryCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closedManually = false;
  let queue: string[] = [];
  let detachListeners: (() => void) | null = null;

  const clearReconnectTimer = (): void => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = (): void => {
    if (closedManually) return;
    if (detachListeners) {
      detachListeners();
      detachListeners = null;
    }

    const socket = createSocket(url);
    activeSocket = socket;

    const handleOpen = (): void => {
      if (socket !== activeSocket || closedManually) return;
      retryCount = 0;
      const pending = queue;
      queue = [];
      for (const msg of pending) {
        socket.send(msg);
      }
      if (typeof onOpen === 'function') onOpen();
    };

    const handleMessage = (event: any): void => {
      if (socket !== activeSocket || closedManually) return;
      if (typeof onMessage === 'function') onMessage(event);
    };

    const handleClose = (event: any): void => {
      if (socket !== activeSocket) return;
      if (detachListeners) {
        detachListeners();
        detachListeners = null;
      }
      if (typeof onClose === 'function') onClose(event);
      if (closedManually || retryCount >= maxRetries) return;

      const base = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, retryCount));
      const delayMs = jitter > 0 ? base + base * Math.random() * jitter : base;
      retryCount += 1;
      if (typeof onReconnect === 'function') onReconnect(retryCount, delayMs);

      clearReconnectTimer();
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delayMs);
    };

    const handleError = (): void => {
      // Errors are typically followed by close; handled there.
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);

    detachListeners = () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
    };
  };

  connect();

  return {
    send(data: string): void {
      if (closedManually) return;
      if (activeSocket && activeSocket.readyState === 1) {
        activeSocket.send(data);
      } else {
        queue.push(data);
      }
    },
    close(code?: number, reason?: string): void {
      closedManually = true;
      clearReconnectTimer();
      queue = [];
      if (detachListeners) {
        detachListeners();
        detachListeners = null;
      }
      if (activeSocket) {
        activeSocket.close(code, reason);
      }
    },
    getReadyState(): number {
      if (closedManually || !activeSocket) return 3;
      return activeSocket.readyState;
    },
    getQueuedCount(): number {
      return queue.length;
    },
  };
}

