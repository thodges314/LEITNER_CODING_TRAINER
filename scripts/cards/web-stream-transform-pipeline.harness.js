await (async () => {
  const factory = typeof createLineSanitizerTransform === 'function'
    ? createLineSanitizerTransform
    : (typeof solution === 'object' ? solution?.createLineSanitizerTransform : solution);
  const runner = typeof runStreamPipeline === 'function'
    ? runStreamPipeline
    : (typeof solution === 'object' ? solution?.runStreamPipeline : undefined);

  // Case 1: Chunks with fragmented lines and redaction
  const transform1 = factory(['secret', 'token']);
  const chunks1 = ['Hello secret\nHow are ', 'you? token is here\nDone.'];
  const res1 = await runner(chunks1, transform1);

  $test.check(
    'Reassembles fragmented chunks and redacts words with flush of final line',
    res1.length === 3 &&
      res1[0] === 'Hello [REDACTED]' &&
      res1[1] === 'How are you? [REDACTED] is here' &&
      res1[2] === 'Done.',
    { lines: res1 }
  );

  // Case 2: Case-insensitive matching and word-boundary safety
  const transform2 = factory(['api', 'key']);
  const chunks2 = ['API is active\napiKey should not be redacted\nmy key is valid\n'];
  const res2 = await runner(chunks2, transform2);

  $test.check(
    'Case-insensitive whole-word redaction preserves substrings (apiKey not matched as key)',
    res2.length === 3 &&
      res2[0] === '[REDACTED] is active' &&
      res2[1] === 'apiKey should not be redacted' &&
      res2[2] === 'my [REDACTED] is valid',
    { lines: res2 }
  );

  // Case 3: Empty input chunks produce empty result
  const transform3 = factory(['hidden']);
  const res3 = await runner([], transform3);
  $test.check(
    'Empty input chunks produce empty array',
    Array.isArray(res3) && res3.length === 0,
    { res3 }
  );

  // Case 4: Multiple newlines in a single chunk
  const transform4 = factory(['password']);
  const chunks4 = ['line1 password\nline2\nline3\n'];
  const res4 = await runner(chunks4, transform4);
  $test.check(
    'Multiple newlines in a single chunk are each emitted as separate lines',
    res4.length === 3 &&
      res4[0] === 'line1 [REDACTED]' &&
      res4[1] === 'line2' &&
      res4[2] === 'line3',
    { lines: res4 }
  );
})();

