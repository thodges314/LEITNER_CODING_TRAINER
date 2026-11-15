interface HeartbeatSocket {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: 'message' | 'close', listener: (event: any) => void): void;
  removeEventListener(type: 'message' | 'close', listener: (event: any) => void): void;
}

interface HeartbeatOptions {
  intervalMs: number;
  timeoutMs: number;
  pingPayload?: string;
  pongPayload?: string;
  onTimeout?: () => void;
}

interface HeartbeatMonitor {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

function createHeartbeatMonitor(
  socket: HeartbeatSocket,
  options: HeartbeatOptions
): HeartbeatMonitor {
  const {
    intervalMs,
    timeoutMs,
    pingPayload = 'PING',
    pongPayload = 'PONG',
    onTimeout,
  } = options;

  let running = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const clearPendingTimeout = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleMessage = (event: any): void => {
    if (event && event.data === pongPayload) {
      clearPendingTimeout();
    }
  };

  const stop = (): void => {
    if (!running) return;
    running = false;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    clearPendingTimeout();
    socket.removeEventListener('message', handleMessage);
    socket.removeEventListener('close', handleClose);
  };

  const handleClose = (): void => {
    stop();
  };

  const start = (): void => {
    if (running) return;
    running = true;
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);

    intervalId = setInterval(() => {
      if (!running) return;
      socket.send(pingPayload);
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          if (!running) return;
          stop();
          if (typeof onTimeout === 'function') onTimeout();
          socket.close(4000, 'Heartbeat timeout');
        }, timeoutMs);
      }
    }, intervalMs);
  };

  return {
    start,
    stop,
    isRunning: () => running,
  };
}

