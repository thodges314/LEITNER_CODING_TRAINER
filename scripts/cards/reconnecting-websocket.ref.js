function createReconnectingWebSocket(url, options = {}) {
  const {
    createSocket = (targetUrl) => new WebSocket(targetUrl),
    baseDelayMs = 100,
    maxDelayMs = 5000,
    maxRetries = Infinity,
    jitter = 0,
    onOpen,
    onMessage,
    onClose,
    onReconnect,
  } = options;

  let activeSocket = null;
  let retryCount = 0;
  let reconnectTimer = null;
  let closedManually = false;
  let queue = [];
  let detachListeners = null;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    if (closedManually) return;
    if (detachListeners) {
      detachListeners();
      detachListeners = null;
    }

    const socket = createSocket(url);
    activeSocket = socket;

    const handleOpen = () => {
      if (socket !== activeSocket || closedManually) return;
      retryCount = 0;
      const pending = queue;
      queue = [];
      for (const msg of pending) {
        socket.send(msg);
      }
      if (typeof onOpen === 'function') onOpen();
    };

    const handleMessage = (event) => {
      if (socket !== activeSocket || closedManually) return;
      if (typeof onMessage === 'function') onMessage(event);
    };

    const handleClose = (event) => {
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

    const handleError = () => {
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
    send(data) {
      if (closedManually) return;
      if (activeSocket && activeSocket.readyState === 1) {
        activeSocket.send(data);
      } else {
        queue.push(data);
      }
    },
    close(code, reason) {
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
    getReadyState() {
      if (closedManually || !activeSocket) return 3;
      return activeSocket.readyState;
    },
    getQueuedCount() {
      return queue.length;
    },
  };
}

