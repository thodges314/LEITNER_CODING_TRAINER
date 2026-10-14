import p1 from './part1.mjs';
import p2 from './part2.mjs';
import p3 from './part3.mjs';

/** All hand-written cases keyed by card id. */
export function loadCases() {
  const all = { ...p1, ...p2, ...p3 };
  const dupes = [p1, p2, p3].flatMap((p) => Object.keys(p)).filter((k, i, a) => a.indexOf(k) !== i);
  if (dupes.length) throw new Error(`Duplicate case ids: ${dupes.join(', ')}`);
  return all;
}

/** Shape stored in topics.json. */
export function toTestCaseItems(list) {
  return list.map((tc) => ({
    description: tc.d,
    input: tc.i,
    expected: tc.x ?? (tc.t ? `Rejects with Error — message matches /${tc.t}/` : tc.e),
  }));
}
