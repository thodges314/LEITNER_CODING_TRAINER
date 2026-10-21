interface PageResult<T> {
  items?: T[];
  nextCursor?: any;
}

async function* paginateAll<T>(fetchPage: (cursor: any | null) => Promise<PageResult<T>>): AsyncGenerator<T, void, unknown> {
  let cursor: any = null;
  while (true) {
    const page = await fetchPage(cursor);
    if (page && page.items) {
      for (const item of page.items) {
        yield item;
      }
    }
    if (!page || page.nextCursor === null || page.nextCursor === undefined) {
      break;
    }
    cursor = page.nextCursor;
  }
}

async function* filterAsyncGenerator<T>(
  asyncGen: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>
): AsyncGenerator<T, void, unknown> {
  for await (const item of asyncGen) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

async function collectGenerator<T>(asyncGen: AsyncIterable<T>, limit: number = Infinity): Promise<T[]> {
  const result: T[] = [];
  for await (const item of asyncGen) {
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}
