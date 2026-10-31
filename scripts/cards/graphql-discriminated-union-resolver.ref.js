function createTypeResolver(typeMap) {
  const entries = Object.entries(typeMap || {});

  return function resolveType(value) {
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
