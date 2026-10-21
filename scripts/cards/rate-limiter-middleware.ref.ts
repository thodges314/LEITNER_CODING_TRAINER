interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface RateLimiterMiddleware {
  (req: { ip: string; [key: string]: any }, res: any, next: () => void): void;
  size: () => number;
}

interface ClientBucket {
  tokens: number;
  last: number;
}

function rateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiterMiddleware {
  const buckets = new Map<string, ClientBucket>(); // ip -> { tokens, last }
  const refillPerMs = limit / windowMs;

  const middleware: RateLimiterMiddleware = Object.assign(
    function (req: { ip: string; [key: string]: any }, res: any, next: () => void): void {
      const t = now();

      // Evict idle clients: a bucket idle for a full window would be full again anyway.
      for (const [ip, b] of buckets) {
        if (t - b.last > windowMs) buckets.delete(ip);
      }

      let bucket = buckets.get(req.ip);
      if (!bucket) {
        bucket = { tokens: limit, last: t };
        buckets.set(req.ip, bucket);
      }
      bucket.tokens = Math.min(limit, bucket.tokens + (t - bucket.last) * refillPerMs);
      bucket.last = t;

      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return next();
      }
      const retryAfterSeconds = Math.ceil((1 - bucket.tokens) / refillPerMs / 1000);
      res.statusCode = 429;
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.end('Too Many Requests');
    },
    {
      size: (): number => buckets.size,
    }
  );

  return middleware;
}
