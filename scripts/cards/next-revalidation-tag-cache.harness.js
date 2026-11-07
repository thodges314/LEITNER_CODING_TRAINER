await (async () => {
  const factory = typeof createTagCacheManager === 'function' ? createTagCacheManager : solution;
  const cache = factory();

  // Case 1: Stores and retrieves data with tags
  cache.set('/api/products/1', { id: 1, name: 'Laptop' }, { tags: ['products', 'tech'] });
  cache.set('/api/products/2', { id: 2, name: 'Headphones' }, { tags: ['products', 'audio'] });
  cache.set('/api/articles/1', { id: 1, title: 'Release Notes' }, { tags: ['news'] });

  const p1 = cache.get('/api/products/1');
  const a1 = cache.get('/api/articles/1');
  $test.check(
    'Stores and retrieves data with tags',
    p1?.name === 'Laptop' && a1?.title === 'Release Notes' && cache.has('/api/products/1'),
    { p1, a1 }
  );

  // Case 2: revalidateTag purges matching keys and returns purged count
  const count = cache.revalidateTag('audio');
  $test.check(
    'revalidateTag purges matching entries and returns purged count',
    count === 1 && cache.get('/api/products/2') === null && !cache.has('/api/products/2'),
    { count, item2: cache.get('/api/products/2') }
  );

  // Case 3: Revalidating shared tag purges all items carrying that tag
  cache.set('/api/products/3', { id: 3, name: 'Monitor' }, { tags: ['products', 'tech'] });
  const productsPurged = cache.revalidateTag('products');
  $test.check(
    'Revalidating shared tag purges all items associated with that tag',
    productsPurged === 2 && // products 1 and 3
      cache.get('/api/products/1') === null &&
      cache.get('/api/products/3') === null &&
      cache.get('/api/articles/1')?.title === 'Release Notes', // unaffected
    { productsPurged, articles1: cache.get('/api/articles/1') }
  );

  // Case 4: Entries with ttlMs expire automatically
  cache.set('/api/temp', { temp: true }, { ttlMs: 1 });
  await new Promise((r) => setTimeout(r, 10));
  $test.check(
    'Entries with ttlMs expire automatically after duration passes',
    cache.get('/api/temp') === null && !cache.has('/api/temp'),
    cache.get('/api/temp')
  );

  // Case 5: clear wipes all entries
  cache.clear();
  $test.check(
    'clear wipes all cached items and tag associations',
    cache.get('/api/articles/1') === null && cache.revalidateTag('news') === 0,
    null
  );
})();
