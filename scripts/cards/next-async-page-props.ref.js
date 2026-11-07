type SearchParamsValue = string | string[] | undefined;

interface RawPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, SearchParamsValue>>;
}

interface NormalizedPageData {
  category: string;
  filters: {
    tags: string[];
    sort: string;
    page: number;
  };
}

const parseAsyncPageProps = async (props: RawPageProps): Promise<NormalizedPageData> => {
  const resolvedParams = await props.params;
  const resolvedSearch = await props.searchParams;

  const rawCategory = resolvedParams?.category;
  const category = typeof rawCategory === 'string' && rawCategory.trim().length > 0
    ? rawCategory.trim()
    : 'all';

  const rawTagVal = resolvedSearch?.tag ?? resolvedSearch?.tags;
  let tags: string[] = [];

  if (Array.isArray(rawTagVal)) {
    tags = rawTagVal
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .map((t) => t.trim());
  } else if (typeof rawTagVal === 'string' && rawTagVal.trim().length > 0) {
    tags = [rawTagVal.trim()];
  }

  const rawSortVal = resolvedSearch?.sort;
  let sort = 'featured';

  if (Array.isArray(rawSortVal)) {
    const firstValid = rawSortVal.find((s) => typeof s === 'string' && s.trim().length > 0);
    if (firstValid) sort = firstValid.trim();
  } else if (typeof rawSortVal === 'string' && rawSortVal.trim().length > 0) {
    sort = rawSortVal.trim();
  }

  const rawPageVal = resolvedSearch?.page;
  let page = 1;

  const pageStr = Array.isArray(rawPageVal) ? rawPageVal[0] : rawPageVal;
  if (typeof pageStr === 'string') {
    const parsed = parseInt(pageStr, 10);
    if (Number.isInteger(parsed) && parsed >= 1) {
      page = parsed;
    }
  }

  return {
    category,
    filters: {
      tags,
      sort,
      page,
    },
  };
};
