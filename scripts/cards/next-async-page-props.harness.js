await (async () => {
  const { render, q } = $dom;
  const fn = typeof CategoryPage === 'function' ? CategoryPage : (typeof solution === 'function' ? solution : (typeof solution === 'object' && solution?.CategoryPage));

  const case1 = 'Awaits params and searchParams to render category title, sort, and page';
  const case2 = 'Selects first valid sort entry and clamps invalid page to 1';
  const case3 = 'Applies safe defaults (category: all, sort: featured, page: 1) when values are missing';
  const case4 = 'Parses multi-digit page numbers and single sort parameter';

  if (typeof fn !== 'function') {
    $test.check(case1, false, { error: 'CategoryPage is not defined' });
    $test.check(case2, false, { error: 'CategoryPage is not defined' });
    $test.check(case3, false, { error: 'CategoryPage is not defined' });
    $test.check(case4, false, { error: 'CategoryPage is not defined' });
    return;
  }

  // Case 1: Standard shoes category with single-string search params
  const el1 = await fn({
    params: Promise.resolve({ category: 'shoes' }),
    searchParams: Promise.resolve({ sort: 'price_asc', page: '3' }),
  });
  const { container: c1 } = render(el1);
  const cat1 = q('[data-testid="category-title"]', c1)?.textContent;
  const sort1 = q('[data-testid="sort-value"]', c1)?.textContent;
  const page1 = q('[data-testid="page-value"]', c1)?.textContent;
  $test.check(
    case1,
    cat1 === 'shoes' && sort1 === 'price_asc' && page1 === '3',
    { cat1, sort1, page1 }
  );

  // Case 2: Array sort, invalid negative page string
  const el2 = await fn({
    params: Promise.resolve({ category: 'electronics' }),
    searchParams: Promise.resolve({ sort: ['rating_desc', 'price_asc'], page: '-2' }),
  });
  const { container: c2 } = render(el2);
  const cat2 = q('[data-testid="category-title"]', c2)?.textContent;
  const sort2 = q('[data-testid="sort-value"]', c2)?.textContent;
  const page2 = q('[data-testid="page-value"]', c2)?.textContent;
  $test.check(
    case2,
    cat2 === 'electronics' && sort2 === 'rating_desc' && page2 === '1',
    { cat2, sort2, page2 }
  );

  // Case 3: Empty params and searchParams
  const el3 = await fn({
    params: Promise.resolve({ category: '' }),
    searchParams: Promise.resolve({}),
  });
  const { container: c3 } = render(el3);
  const cat3 = q('[data-testid="category-title"]', c3)?.textContent;
  const sort3 = q('[data-testid="sort-value"]', c3)?.textContent;
  const page3 = q('[data-testid="page-value"]', c3)?.textContent;
  $test.check(
    case3,
    cat3 === 'all' && sort3 === 'featured' && page3 === '1',
    { cat3, sort3, page3 }
  );

  // Case 4: Books category with page 12
  const el4 = await fn({
    params: Promise.resolve({ category: 'books' }),
    searchParams: Promise.resolve({ sort: 'newest', page: '12' }),
  });
  const { container: c4 } = render(el4);
  const cat4 = q('[data-testid="category-title"]', c4)?.textContent;
  const sort4 = q('[data-testid="sort-value"]', c4)?.textContent;
  const page4 = q('[data-testid="page-value"]', c4)?.textContent;
  $test.check(
    case4,
    cat4 === 'books' && sort4 === 'newest' && page4 === '12',
    { cat4, sort4, page4 }
  );
})();
