type PredicateFn = (value: any) => boolean;

interface TypeResolverMap {
  [typeName: string]: PredicateFn;
}

function createTypeResolver(
  typeMap: TypeResolverMap
): (value: any) => string | null {
  const entries = Object.entries(typeMap || {});

  return function resolveType(value: any): string | null {
    if (!value || typeof value !== 'object') return null;

    if (typeof value.__typename === 'string') {
      return value.__typename;
    }

    for (const [typeName, predicate] of entries) {
      if (typeof predicate === 'function' && predicate(value)) {
        return typeName;
      }
    }

    return null;
  };
}
