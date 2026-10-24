function arrayIntersection<T>(a: T[], b: T[]): T[] {
  const setA = new Set<T>(a);
  const intersection = new Set<T>();
  for (const item of b) {
    if (setA.has(item)) intersection.add(item);
  }
  return Array.from(intersection);
}

function arrayUnion<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set<T>([...a, ...b]));
}

function arrayDifference<T>(a: T[], b: T[]): T[] {
  const setB = new Set<T>(b);
  return Array.from(new Set<T>(a.filter((item) => !setB.has(item))));
}
