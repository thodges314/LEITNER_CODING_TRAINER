const createTokenBucket = (options) => {
  const { capacity, refillRate, initialTokens } = options;
  let tokens = initialTokens !== undefined ? Math.min(capacity, initialTokens) : capacity;
  let lastRefillTime = Date.now();
  let timerId = null;

  const queue = [];

  const refill = () => {
    const now = Date.now();
    const elapsed = now - lastRefillTime;
    tokens = Math.min(capacity, tokens + elapsed * (refillRate / 1000));
    lastRefillTime = now;
  };

  const scheduleDrain = () => {
    if (timerId !== null || queue.length === 0) return;
    refill();
    const needed = queue[0].tokens - tokens;
    const waitMs = Math.max(1, Math.ceil((Math.max(0, needed) / refillRate) * 1000));
    timerId = setTimeout(drainQueue, waitMs);
  };

  const drainQueue = () => {
    timerId = null;
    refill();
    if (queue.length === 0) return;

    while (queue.length > 0) {
      const next = queue[0];
      if (tokens >= next.tokens) {
        tokens -= next.tokens;
        queue.shift();
        next.resolve();
      } else {
        scheduleDrain();
        return;
      }
    }
  };

  return {
    tryAcquire(requested = 1) {
      refill();
      if (queue.length === 0 && tokens >= requested) {
        tokens -= requested;
        return true;
      }
      return false;
    },

    acquire(requested = 1) {
      refill();
      if (queue.length === 0 && tokens >= requested) {
        tokens -= requested;
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        queue.push({ tokens: requested, resolve });
        scheduleDrain();
      });
    },

    getTokens() {
      refill();
      return tokens;
    },
  };
};
