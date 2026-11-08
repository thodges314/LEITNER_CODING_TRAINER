import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by async stream harness', ...o });

export default {
  'stream-event-micro-batcher': [
    r(
      'Buffering 2 items does not flush yet (size === 2)',
      'batcher.add("a"); batcher.add("b"); batcher.size()',
      '2'
    ),
    r(
      'Reaching maxBatchSize 3 immediately flushes batch and clears buffer',
      'batcher.add("c"); await Promise.all([p1, p2, p3])',
      '[["a", "b", "c"]]'
    ),
    r(
      'Fewer items than maxBatchSize flush when maxWaitMs window expires',
      'batcher.add("x"); batcher.add("y"); await sleep(60)',
      '[["x", "y"]]'
    ),
    r(
      'Manual flush() drains buffer immediately before time window expires',
      'batcher.add(1); batcher.add(2); await batcher.flush()',
      '[[1, 2]]'
    ),
    r(
      'flushHandler error rejects all item promises in the failing batch',
      'batcher.add("err1"); batcher.add("err2")',
      'Rejects with Error'
    ),
  ],

  'web-stream-transform-pipeline': [
    r(
      'Reassembles fragmented chunks and redacts words with flush of final line',
      'runStreamPipeline(["Hello secret\\nHow are ", "you? token is here\\nDone."], transform)',
      '["Hello [REDACTED]", "How are you? [REDACTED] is here", "Done."]'
    ),
    r(
      'Case-insensitive whole-word redaction preserves substrings (apiKey not matched as key)',
      'runStreamPipeline(["API is active\\napiKey should not be redacted\\nmy key is valid\\n"], transform)',
      '["[REDACTED] is active", "apiKey should not be redacted", "my [REDACTED] is valid"]'
    ),
    r(
      'Empty input chunks produce empty array',
      'runStreamPipeline([], transform)',
      '[]'
    ),
    r(
      'Multiple newlines in a single chunk are each emitted as separate lines',
      'runStreamPipeline(["line1 password\\nline2\\nline3\\n"], transform)',
      '["line1 [REDACTED]", "line2", "line3"]'
    ),
  ],
};
