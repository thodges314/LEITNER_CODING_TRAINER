function createHeartbeatMonitor(socket, options) {
  const {
    intervalMs,
    timeoutMs,
    pingPayload = 'PING',
    pongPayload = 'PONG',
    onTimeout,
  } = options;

  let running = false;
  let intervalId = null;
  let timeoutId = null;

  const clearPendingTimeout = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleMessage = (event) => {
    if (event && event.data === pongPayload) {
      clearPendingTimeout();
    }
  };

  const stop = () => {
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

  const handleClose = () => {
    stop();
  };

  const start = () => {
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

