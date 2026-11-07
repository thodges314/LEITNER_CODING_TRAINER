await (async () => {
  const fn = typeof createTokenBucket === 'function' ? createTokenBucket : solution;

  // Case 1: tryAcquire consumes tokens when available and returns false when empty
  const limiter1 = fn({
    capacity: 2,
    refillRate: 10, // 10 tokens / sec = 1 token per 100ms
    initialTokens: 2,
  });

  const a1 = limiter1.tryAcquire(1);
  const a2 = limiter1.tryAcquire(1);
  const a3 = limiter1.tryAcquire(1);

  $test.check(
    'tryAcquire consumes available tokens and returns false when exhausted without blocking',
    a1 === true && a2 === true && a3 === false && limiter1.getTokens() < 1,
    { a1, a2, a3, tokens: limiter1.getTokens() }
  );

  // Case 2: acquire resolves after tokens refill
  const limiter2 = fn({
    capacity: 2,
    refillRate: 50, // 50 tokens / sec = 1 token per 20ms
    initialTokens: 0,
  });

  const start = Date.now();
  await limiter2.acquire(1);
  const elapsed = Date.now() - start;

  $test.check(
    'acquire waits for sufficient tokens to refill before resolving',
    elapsed >= 15 && limiter2.getTokens() >= 0,
    { elapsed, tokens: limiter2.getTokens() }
  );

  // Case 3: FIFO ordering is strictly preserved among queued acquires
  const limiter3 = fn({
    capacity: 2,
    refillRate: 100, // 100 tokens / sec = 1 token per 10ms
    initialTokens: 0,
  });

  const resolutionOrder = [];
  const p1 = limiter3.acquire(1).then(() => resolutionOrder.push('first'));
  const p2 = limiter3.acquire(1).then(() => resolutionOrder.push('second'));
  const p3 = limiter3.acquire(1).then(() => resolutionOrder.push('third'));

  await Promise.all([p1, p2, p3]);

  $test.check(
    'Multiple queued acquire requests are resolved strictly in FIFO order',
    resolutionOrder.length === 3 &&
      resolutionOrder[0] === 'first' &&
      resolutionOrder[1] === 'second' &&
      resolutionOrder[2] === 'third',
    { resolutionOrder }
  );

  // Case 4: Available tokens cannot exceed capacity ceiling over time
  const limiter4 = fn({
    capacity: 3,
    refillRate: 200,
    initialTokens: 1,
  });

  await new Promise((r) => setTimeout(r, 40));
  const tokensCapped = limiter4.getTokens();

  $test.check(
    'Refilled tokens are capped at the specified capacity limit',
    tokensCapped <= 3 && tokensCapped >= 2.9,
    { tokensCapped }
  );
})();
