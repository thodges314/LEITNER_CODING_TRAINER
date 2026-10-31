type ResolverFn = (...args: any[]) => any;

interface ResolverMap {
  [typeName: string]: {
    [fieldName: string]: ResolverFn | any;
  };
}

function mergeResolvers(...resolverMaps: ResolverMap[]): ResolverMap {
  const merged: ResolverMap = {};

  for (const map of resolverMaps) {
    if (!map || typeof map !== 'object') continue;

    for (const typeName of Object.keys(map)) {
      const typeFields = map[typeName];
      if (!typeFields || typeof typeFields !== 'object') continue;

      if (!merged[typeName]) {
        merged[typeName] = {};
      }

      for (const fieldName of Object.keys(typeFields)) {
        if (Object.prototype.hasOwnProperty.call(merged[typeName], fieldName)) {
          throw new Error(
            `Conflict: resolver for "${typeName}.${fieldName}" is defined multiple times`
          );
        }
        merged[typeName][fieldName] = typeFields[fieldName];
      }
    }
  }

  return merged;
}
