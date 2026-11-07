interface TokenBucketOptions {
  capacity: number;
  refillRate: number;
  initialTokens?: number;
}

interface TokenBucketLimiter {
  acquire(tokens?: number): Promise<void>;
  tryAcquire(tokens?: number): boolean;
  getTokens(): number;
}

const createTokenBucket = (options: TokenBucketOptions): TokenBucketLimiter => {
  const { capacity, refillRate, initialTokens } = options;
  let tokens = initialTokens !== undefined ? Math.min(capacity, initialTokens) : capacity;
  let lastRefillTime = Date.now();
  let timerId: ReturnType<typeof setTimeout> | null = null;

  interface QueuedRequest {
    tokens: number;
    resolve: () => void;
  }

  const queue: QueuedRequest[] = [];

  const refill = (): void => {
    const now = Date.now();
    const elapsed = now - lastRefillTime;
    tokens = Math.min(capacity, tokens + elapsed * (refillRate / 1000));
    lastRefillTime = now;
  };

  const scheduleDrain = (): void => {
    if (timerId !== null || queue.length === 0) return;
    refill();
    const needed = queue[0].tokens - tokens;
    const waitMs = Math.max(1, Math.ceil((Math.max(0, needed) / refillRate) * 1000));
    timerId = setTimeout(drainQueue, waitMs);
  };

  const drainQueue = (): void => {
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
    tryAcquire(requested = 1): boolean {
      refill();
      if (queue.length === 0 && tokens >= requested) {
        tokens -= requested;
        return true;
      }
      return false;
    },

    acquire(requested = 1): Promise<void> {
      refill();
      if (queue.length === 0 && tokens >= requested) {
        tokens -= requested;
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        queue.push({ tokens: requested, resolve });
        scheduleDrain();
      });
    },

    getTokens(): number {
      refill();
      return tokens;
    },
  };
};
