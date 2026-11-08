type CacheStrategy = 'static' | 'timed' | 'dynamic';

interface CacheStrategyOptions {
  strategy: CacheStrategy;
  revalidateSeconds?: number;
  tags?: string[];
}

interface NextFetchInit {
  cache?: 'force-cache' | 'no-store';
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

interface SegmentConfig {
  revalidate?: number | false;
  dynamic?: 'auto' | 'force-dynamic' | 'force-static';
}

interface NextDataCacheConfig {
  fetchOptions: NextFetchInit;
  segmentConfig: SegmentConfig;
}

function buildDataCacheConfig(options: CacheStrategyOptions): NextDataCacheConfig {
  const { strategy, revalidateSeconds, tags } = options;

  if (strategy === 'static') {
    const fetchOptions: NextFetchInit = { cache: 'force-cache' };
    if (tags && tags.length > 0) {
      fetchOptions.next = { tags };
    }
    return {
      fetchOptions,
      segmentConfig: { dynamic: 'force-static', revalidate: false },
    };
  }

  if (strategy === 'timed') {
    const seconds =
      typeof revalidateSeconds === 'number' && revalidateSeconds > 0
        ? revalidateSeconds
        : 60;
    const nextInit: { revalidate: number; tags?: string[] } = { revalidate: seconds };
    if (tags && tags.length > 0) {
      nextInit.tags = tags;
    }
    return {
      fetchOptions: { next: nextInit },
      segmentConfig: { revalidate: seconds },
    };
  }

  return {
    fetchOptions: { cache: 'no-store' },
    segmentConfig: { dynamic: 'force-dynamic', revalidate: 0 },
  };
}
