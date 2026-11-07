await (async () => {
  const fn = typeof generateMetadata === 'function' ? generateMetadata : solution;

  if (typeof articlesStore !== 'undefined' && articlesStore?.clear) {
    articlesStore.clear();
    articlesStore.set('tech/nextjs-15-deep-dive', {
      title: 'Next.js 15 Deep Dive',
      summary: 'Exploring React Server Actions and Async Request APIs in Next.js 15.',
      thumbnailUrl: 'https://example.com/images/next15.png',
      publishedAt: '2026-11-01T00:00:00Z',
      author: 'Sarah Connor',
    });
    articlesStore.set('design/minimalist-ui', {
      title: 'Minimalist UI Principles',
      summary: 'Why negative space and semantic markup drive conversions.',
      publishedAt: '2026-10-15T00:00:00Z',
      author: 'John Doe',
    });
  }

  // Case 1: Found article generates full dynamic metadata with canonical URL and openGraph images
  const m1 = await fn({ params: { category: 'tech', slug: 'nextjs-15-deep-dive' } });
  $test.check(
    'Found article generates dynamic title, description, canonical URL, and openGraph image',
    m1?.title === 'Next.js 15 Deep Dive | Portal' &&
      m1?.description?.includes('React Server Actions') &&
      m1?.alternates?.canonical === 'https://example.com/articles/tech/nextjs-15-deep-dive' &&
      m1?.openGraph?.type === 'article' &&
      m1?.openGraph?.images?.[0]?.url === 'https://example.com/images/next15.png' &&
      m1?.openGraph?.authors?.[0] === 'Sarah Connor',
    m1
  );

  // Case 2: Article without thumbnail provides empty openGraph.images array
  const m2 = await fn({ params: { category: 'design', slug: 'minimalist-ui' } });
  $test.check(
    'Article without thumbnail returns empty openGraph images array',
    m2?.title === 'Minimalist UI Principles | Portal' &&
      Array.isArray(m2?.openGraph?.images) &&
      m2?.openGraph?.images.length === 0,
    m2
  );

  // Case 3: searchParams preview === 'true' sets robots to noindex, nofollow
  const m3 = await fn({
    params: { category: 'tech', slug: 'nextjs-15-deep-dive' },
    searchParams: { preview: 'true' },
  });
  $test.check(
    'Preview searchParam sets robots to noindex, nofollow',
    m3?.robots?.index === false && m3?.robots?.follow === false,
    m3
  );

  // Case 4: Missing article returns 404 fallback metadata
  const m4 = await fn({ params: { category: 'unknown', slug: 'missing-article' } });
  $test.check(
    'Missing article returns 404 fallback title and description',
    m4?.title === 'Article Not Found | Portal' && m4?.description?.includes('could not be located'),
    m4
  );
})();
