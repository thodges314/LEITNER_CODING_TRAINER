interface ChunkBatchOptions<T, R> {
  batchSize: number;
  concurrency: number;
  processItem: (item: T, index: number) => Promise<R>;
  onError?: (item: T, error: Error, index: number) => void;
}

interface ChunkBatchResult<R> {
  results: (R | null)[];
  successfulCount: number;
  failureCount: number;
}

const chunkedBatchPipeline = async <T, R>(
  items: T[],
  options: ChunkBatchOptions<T, R>
): Promise<ChunkBatchResult<R>> => {
  const { batchSize, concurrency, processItem, onError } = options;
  const results: (R | null)[] = new Array(items.length).fill(null);
  let successfulCount = 0;
  let failureCount = 0;

  for (let batchStart = 0; batchStart < items.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, items.length);
    let nextIndex = batchStart;

    const worker = async (): Promise<void> => {
      while (nextIndex < batchEnd) {
        const currentIndex = nextIndex++;
        const item = items[currentIndex];
        try {
          const res = await processItem(item, currentIndex);
          results[currentIndex] = res;
          successfulCount++;
        } catch (err) {
          failureCount++;
          if (typeof onError === 'function') {
            onError(item, err instanceof Error ? err : new Error(String(err)), currentIndex);
          }
        }
      }
    };

    const workerCount = Math.min(concurrency, batchEnd - batchStart);
    const workers: Promise<void>[] = [];
    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
  }

  return {
    results,
    successfulCount,
    failureCount,
  };
};
