await (async () => {
  const fn = typeof generateStaticParams === 'function' ? generateStaticParams : solution;

  const mockCategories = [
    {
      name: 'Components',
      slug: 'components',
      topics: [
        { slug: 'button', title: 'Button Component' },
        { slug: 'modal', title: 'Modal Dialog' },
      ],
    },
    {
      name: 'Routing',
      slug: 'routing',
      topics: [
        { slug: 'intercepting', title: 'Intercepting Routes', published: true },
        { slug: 'parallel', title: 'Parallel Routes', published: false }, // unpublished
        { slug: 'dynamic', title: 'Dynamic Segments' },
      ],
    },
    {
      name: 'Invalid Category',
      slug: '',
      topics: [{ slug: 'hidden', title: 'Hidden' }],
    },
    {
      name: 'Duplicate Category',
      slug: 'components',
      topics: [
        { slug: 'button', title: 'Duplicate Button' }, // duplicate
        { slug: 'toast', title: 'Toast Notification' },
      ],
    },
  ];

  const actual = fn(mockCategories);

  // Case 1: Flattens published topics into sorted category and slug params
  $test.check(
    'Flattens nested categories into sorted category and slug params',
    Array.isArray(actual) &&
      actual.length === 5 &&
      actual[0].category === 'components' && actual[0].slug === 'button' &&
      actual[1].category === 'components' && actual[1].slug === 'modal' &&
      actual[2].category === 'components' && actual[2].slug === 'toast',
    actual
  );

  // Case 2: Filters out unpublished topics (published: false)
  let hasUnpublished = false;
  for (const item of (Array.isArray(actual) ? actual : [])) {
    if (item?.category === 'routing' && item?.slug === 'parallel') hasUnpublished = true;
  }
  $test.check(
    'Excludes topics where published is false',
    !hasUnpublished,
    actual
  );

  // Case 3: Skips categories with missing or empty slug
  let hasEmptyCategory = false;
  for (const item of (Array.isArray(actual) ? actual : [])) {
    if (item?.category === '' || item?.slug === 'hidden') hasEmptyCategory = true;
  }
  $test.check(
    'Skips categories with invalid or empty slug',
    !hasEmptyCategory,
    actual
  );

  // Case 4: Dedupes identical category and slug entries
  let buttonCount = 0;
  for (const item of (Array.isArray(actual) ? actual : [])) {
    if (item?.category === 'components' && item?.slug === 'button') buttonCount++;
  }
  $test.check(
    'Dedupes duplicate category and slug pairs',
    buttonCount === 1,
    buttonCount
  );
})();
