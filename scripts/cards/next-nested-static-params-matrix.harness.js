await (async () => {
  const fn = typeof generateStaticParams === 'function'
    ? generateStaticParams
    : (typeof solution === 'object' && typeof solution?.generateStaticParams === 'function' ? solution.generateStaticParams : null);

  const case1 = 'Generates static params for flat articles in a single category';
  const case2 = 'Generates nested Cartesian product for recursive subpage trees';
  const case3 = 'Trims and URI-decodes encoded category and slug segments';
  const case4 = 'Safely ignores empty categories, invalid slug nodes, and empty input trees';

  if (!fn) {
    $test.check(case1, false, { error: 'generateStaticParams is not defined' });
    $test.check(case2, false, { error: 'generateStaticParams is not defined' });
    $test.check(case3, false, { error: 'generateStaticParams is not defined' });
    $test.check(case4, false, { error: 'generateStaticParams is not defined' });
    return;
  }

  // 1. Flat articles in single category
  {
    const input = [
      {
        category: 'tutorials',
        articles: [
          { slug: 'intro' },
          { slug: 'getting-started' },
        ],
      },
    ];
    const res = await fn(input);
    const expected = [
      { category: 'tutorials', slug: ['intro'] },
      { category: 'tutorials', slug: ['getting-started'] },
    ];
    const passed = Array.isArray(res) &&
      res.length === 2 &&
      JSON.stringify(res) === JSON.stringify(expected);

    $test.check(case1, passed, { received: res, expected });
  }

  // 2. Recursive subpage trees (3 levels deep)
  {
    const input = [
      {
        category: 'docs',
        articles: [
          {
            slug: 'routing',
            subpages: [
              {
                slug: 'dynamic-routes',
                subpages: [
                  { slug: 'catch-all' },
                ],
              },
              { slug: 'parallel-routes' },
            ],
          },
        ],
      },
      {
        category: 'api',
        articles: [
          { slug: 'headers' },
        ],
      },
    ];
    const res = await fn(input);
    const expected = [
      { category: 'docs', slug: ['routing'] },
      { category: 'docs', slug: ['routing', 'dynamic-routes'] },
      { category: 'docs', slug: ['routing', 'dynamic-routes', 'catch-all'] },
      { category: 'docs', slug: ['routing', 'parallel-routes'] },
      { category: 'api', slug: ['headers'] },
    ];
    const passed = Array.isArray(res) &&
      res.length === 5 &&
      JSON.stringify(res) === JSON.stringify(expected);

    $test.check(case2, passed, { received: res, expected });
  }

  // 3. Trims and URI-decodes encoded segments
  {
    const input = [
      {
        category: ' web%20dev ',
        articles: [
          {
            slug: ' next%20js ',
            subpages: [
              { slug: ' app%2Frouter ' },
            ],
          },
        ],
      },
    ];
    const res = await fn(input);
    const expected = [
      { category: 'web dev', slug: ['next js'] },
      { category: 'web dev', slug: ['next js', 'app/router'] },
    ];
    const passed = Array.isArray(res) &&
      res.length === 2 &&
      JSON.stringify(res) === JSON.stringify(expected);

    $test.check(case3, passed, { received: res, expected });
  }

  // 4. Edge cases: empty/whitespace category, invalid nodes, empty tree
  {
    const input = [
      { category: '   ', articles: [{ slug: 'valid' }] },
      {
        category: 'guides',
        articles: [
          { slug: '' },
          { slug: '   ' },
          { slug: 'valid-guide' },
          null,
        ],
      },
    ];
    const res1 = await fn(input);
    const res2 = await fn([]);
    const res3 = await fn(undefined);

    const passed = Array.isArray(res1) &&
      res1.length === 1 &&
      res1[0].category === 'guides' &&
      JSON.stringify(res1[0].slug) === JSON.stringify(['valid-guide']) &&
      Array.isArray(res2) && res2.length === 0 &&
      Array.isArray(res3) && res3.length === 0;

    $test.check(case4, passed, { res1, res2, res3 });
  }
})();
