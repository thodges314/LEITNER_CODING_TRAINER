await (async () => {
  const fn = typeof parseAsyncPageProps === 'function' ? parseAsyncPageProps : solution;

  // Case 1: Resolves promises with single string query params
  const p1 = {
    params: Promise.resolve({ category: 'shoes' }),
    searchParams: Promise.resolve({ tag: 'running', sort: 'price_asc', page: '3' }),
  };
  const r1 = await fn(p1);
  $test.check(
    'Resolves promises and parses single-string query params',
    r1?.category === 'shoes' &&
      Array.isArray(r1?.filters?.tags) &&
      r1?.filters?.tags?.[0] === 'running' &&
      r1?.filters?.sort === 'price_asc' &&
      r1?.filters?.page === 3,
    r1
  );

  // Case 2: Normalizes multi-value array query params (duplicate keys like ?tag=shoes&tag=sale)
  const p2 = {
    params: Promise.resolve({ category: 'apparel' }),
    searchParams: Promise.resolve({ tag: ['shoes', 'sale', ''] }),
  };
  const r2 = await fn(p2);
  $test.check(
    'Normalizes multi-value array query params into trimmed string array',
    r2?.category === 'apparel' &&
      r2?.filters?.tags?.length === 2 &&
      r2?.filters?.tags?.[0] === 'shoes' &&
      r2?.filters?.tags?.[1] === 'sale',
    r2
  );

  // Case 3: Applies safe defaults when searchParams is empty
  const p3 = {
    params: Promise.resolve({ category: 'gear' }),
    searchParams: Promise.resolve({}),
  };
  const r3 = await fn(p3);
  $test.check(
    'Applies safe defaults when searchParams is empty',
    r3?.category === 'gear' &&
      r3?.filters?.sort === 'featured' &&
      r3?.filters?.page === 1 &&
      Array.isArray(r3?.filters?.tags) &&
      r3?.filters?.tags?.length === 0,
    r3
  );

  // Case 4: Handles duplicate sort parameter by selecting first valid entry
  const p4 = {
    params: Promise.resolve({ category: 'electronics' }),
    searchParams: Promise.resolve({ sort: ['rating_desc', 'price_asc'], page: '-2' }),
  };
  const r4 = await fn(p4);
  $test.check(
    'Selects first valid sort entry and clamps negative page to 1',
    r4?.category === 'electronics' &&
      r4?.filters?.sort === 'rating_desc' &&
      r4?.filters?.page === 1,
    r4
  );
})();

