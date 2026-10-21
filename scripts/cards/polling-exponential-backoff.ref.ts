interface PollOptions {
  initialInterval?: number;
  backoffFactor?: number;
  maxAttempts?: number;
}

async function pollUntil<T>(
  fn: () => Promise<T>,
  predicate: (result: T) => boolean,
  options: PollOptions = {}
): Promise<T> {
  const initialInterval = options.initialInterval ?? 50;
  const backoffFactor = options.backoffFactor ?? 2;
  const maxAttempts = options.maxAttempts ?? 5;

  let currentInterval = initialInterval;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (predicate(result)) {
      return result;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, currentInterval));
      currentInterval *= backoffFactor;
    }
  }
  throw new Error('Polling timed out');
}
