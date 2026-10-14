function arrayIntersection(a, b) {
  const setA = new Set(a);
  const intersection = new Set();
  for (const item of b) {
    if (setA.has(item)) intersection.add(item);
  }
  return Array.from(intersection);
}

function arrayUnion(a, b) {
  return Array.from(new Set([...a, ...b]));
}

function arrayDifference(a, b) {
  const setB = new Set(b);
  return Array.from(new Set(a.filter((item) => !setB.has(item))));
}
