const chunkedBatchPipeline = async (items, options) => {
  const { batchSize, concurrency, processItem, onError } = options;
  const results = new Array(items.length).fill(null);
  let successfulCount = 0;
  let failureCount = 0;

  for (let batchStart = 0; batchStart < items.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, items.length);
    let nextIndex = batchStart;

    const worker = async () => {
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
    const workers = [];
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
