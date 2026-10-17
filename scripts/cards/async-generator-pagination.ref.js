async function* paginateAll(fetchPage) {
  let cursor = null;
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

async function* filterAsyncGenerator(asyncGen, predicate) {
  for await (const item of asyncGen) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

async function collectGenerator(asyncGen, limit = Infinity) {
  const result = [];
  for await (const item of asyncGen) {
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}
