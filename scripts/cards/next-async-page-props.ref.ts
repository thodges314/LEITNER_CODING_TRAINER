type SearchParamsValue = string | string[] | undefined;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, SearchParamsValue>>;
}

async function CategoryPage({ params, searchParams }: PageProps): Promise<React.ReactElement> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const rawCat = resolvedParams?.category;
  const category = typeof rawCat === 'string' && rawCat.trim().length > 0 ? rawCat.trim() : 'all';

  const rawSort = resolvedSearch?.sort;
  let sort = 'featured';
  if (Array.isArray(rawSort)) {
    const firstValid = rawSort.find((s) => typeof s === 'string' && s.trim().length > 0);
    if (firstValid) sort = firstValid.trim();
  } else if (typeof rawSort === 'string' && rawSort.trim().length > 0) {
    sort = rawSort.trim();
  }

  const rawPage = resolvedSearch?.page;
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  let page = 1;
  if (typeof pageStr === 'string') {
    const parsed = parseInt(pageStr, 10);
    if (Number.isInteger(parsed) && parsed >= 1) {
      page = parsed;
    }
  }

  return (
    <main data-testid="category-page">
      <h1 data-testid="category-title">{category}</h1>
      <span data-testid="sort-value">{sort}</span>
      <span data-testid="page-value">{String(page)}</span>
    </main>
  );
}
