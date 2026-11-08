type DynamicOption = 'auto' | 'force-dynamic' | 'error' | 'force-static';
type RevalidateOption = false | 0 | number;
type FetchCacheOption =
  | 'auto'
  | 'default-cache'
  | 'only-cache'
  | 'force-cache'
  | 'force-no-store'
  | 'default-no-store'
  | 'only-no-store';

interface SegmentConfig {
  segmentPath: string;
  dynamic?: DynamicOption;
  revalidate?: RevalidateOption;
  fetchCache?: FetchCacheOption;
}

interface ResolvedRouteConfig {
  effectiveDynamic: DynamicOption;
  effectiveRevalidate: RevalidateOption;
  effectiveFetchCache: FetchCacheOption;
  routeMode: 'static' | 'isr' | 'dynamic';
  hasConflict: boolean;
  conflictReason?: string;
}

function resolveRouteSegmentConfig(segments: SegmentConfig[] = []): ResolvedRouteConfig {
  let effectiveDynamic: DynamicOption = 'auto';
  let effectiveRevalidate: RevalidateOption = false;
  let effectiveFetchCache: FetchCacheOption = 'auto';

  let hasForceDynamic = false;
  let hasForceStatic = false;
  let hasRevalidateZero = false;
  let minPositiveRevalidate: number | null = null;
  let forceFetchCache: FetchCacheOption | null = null;
  let lastFetchCache: FetchCacheOption | null = null;
  let lastDynamic: DynamicOption | null = null;

  for (const seg of segments) {
    if (!seg) continue;

    if (seg.dynamic) {
      lastDynamic = seg.dynamic;
      if (seg.dynamic === 'force-dynamic') hasForceDynamic = true;
      if (seg.dynamic === 'force-static') hasForceStatic = true;
    }

    if (seg.revalidate !== undefined) {
      if (seg.revalidate === 0) {
        hasRevalidateZero = true;
      } else if (typeof seg.revalidate === 'number' && seg.revalidate > 0) {
        if (minPositiveRevalidate === null || seg.revalidate < minPositiveRevalidate) {
          minPositiveRevalidate = seg.revalidate;
        }
      }
    }

    if (seg.fetchCache) {
      lastFetchCache = seg.fetchCache;
      if (seg.fetchCache.startsWith('force-')) {
        forceFetchCache = seg.fetchCache;
      }
    }
  }

  // Resolve dynamic
  if (hasForceDynamic) {
    effectiveDynamic = 'force-dynamic';
  } else if (hasForceStatic) {
    effectiveDynamic = 'force-static';
  } else if (lastDynamic) {
    effectiveDynamic = lastDynamic;
  }

  // Resolve revalidate
  if (hasRevalidateZero) {
    effectiveRevalidate = 0;
  } else if (minPositiveRevalidate !== null) {
    effectiveRevalidate = minPositiveRevalidate;
  }

  // Resolve fetchCache
  if (forceFetchCache) {
    effectiveFetchCache = forceFetchCache;
  } else if (lastFetchCache) {
    effectiveFetchCache = lastFetchCache;
  }

  // Check conflicts
  let hasConflict = false;
  let conflictReason: string | undefined;

  if (hasForceStatic && hasForceDynamic) {
    hasConflict = true;
    conflictReason = 'Conflicting segment options: cannot combine force-static with force-dynamic in the same route hierarchy.';
  } else if (hasForceStatic && (effectiveRevalidate === 0 || effectiveFetchCache === 'force-no-store')) {
    hasConflict = true;
    conflictReason = 'Conflicting segment options: force-static cannot be paired with revalidate = 0 or force-no-store data fetching.';
  }

  // Classify routeMode
  let routeMode: 'static' | 'isr' | 'dynamic' = 'static';
  if (
    effectiveDynamic === 'force-dynamic' ||
    effectiveRevalidate === 0 ||
    effectiveFetchCache === 'force-no-store'
  ) {
    routeMode = 'dynamic';
  } else if (typeof effectiveRevalidate === 'number' && effectiveRevalidate > 0) {
    routeMode = 'isr';
  } else {
    routeMode = 'static';
  }

  return {
    effectiveDynamic,
    effectiveRevalidate,
    effectiveFetchCache,
    routeMode,
    hasConflict,
    conflictReason,
  };
}

