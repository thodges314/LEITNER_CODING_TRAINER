import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by async stream harness', ...o });

export default {
  'chunked-batch-pipeline': [
    r(
      'Processes all items preserving index and respecting concurrency limit',
      'chunkedBatchPipeline([1, 2, 3, 4, 5, 6, 7], { batchSize: 4, concurrency: 2, processItem })',
      '{ results: [10, 20, 30, 40, 50, 60, 70], successfulCount: 7, failureCount: 0 }'
    ),
    r(
      'Failed items record null in results and invoke onError without failing the pipeline',
      'chunkedBatchPipeline([10, -5, 20, -1, 30], { batchSize: 5, concurrency: 3, processItem, onError })',
      '{ results: [5, null, 10, null, 15], successfulCount: 3, failureCount: 2 }'
    ),
    r(
      'Sequential batching waits for each batch to completely finish before starting next batch',
      'chunkedBatchPipeline(["a", "b", "c", "d"], { batchSize: 2, concurrency: 2, processItem })',
      'Batch 2 waits for Batch 1'
    ),
    r(
      'Empty input returns zero counts and empty results array',
      'chunkedBatchPipeline([], { batchSize: 10, concurrency: 2, processItem })',
      '{ results: [], successfulCount: 0, failureCount: 0 }'
    ),
  ],

  'stream-token-bucket-shaper': [
    r(
      'tryAcquire consumes available tokens and returns false when exhausted without blocking',
      'limiter.tryAcquire(1); limiter.tryAcquire(1); limiter.tryAcquire(1)',
      'true, true, false'
    ),
    r(
      'acquire waits for sufficient tokens to refill before resolving',
      'await limiter.acquire(1)',
      'Resolves after token refill duration'
    ),
    r(
      'Multiple queued acquire requests are resolved strictly in FIFO order',
      'limiter.acquire(1); limiter.acquire(1); limiter.acquire(1)',
      '["first", "second", "third"]'
    ),
    r(
      'Refilled tokens are capped at the specified capacity limit',
      'limiter.getTokens() after wait',
      '<= capacity'
    ),
  ],

  'k-way-stream-merger': [
    r(
      'Merges K sorted async streams into a single ascending sequence',
      'mergeKAsyncStreams([s1, s2, s3])',
      '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]'
    ),
    r(
      'Applies custom comparator for complex object streams',
      'mergeKAsyncStreams([o1, o2], (a, b) => b.t - a.t)',
      '["a", "c", "b", "d"]'
    ),
    r(
      'Handles empty streams alongside populated streams without errors',
      'mergeKAsyncStreams([empty1, s2, empty2])',
      '[5, 10]'
    ),
    r(
      'Empty stream array yields no values and completes immediately',
      'mergeKAsyncStreams([])',
      '[]'
    ),
  ],
};

