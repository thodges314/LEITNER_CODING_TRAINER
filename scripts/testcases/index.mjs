import p1 from './part1.mjs';
import p2 from './part2.mjs';
import p3 from './part3.mjs';
import { overrides, appends } from './part4.mjs';
import { newCards } from './newcards.mjs';

// Cards whose reference solutions were completed: their previously "spec only" cases are now real checks.
const NOW_VERIFIED = new Set([
  'deep-clone',
  'event-emitter',
  'curry-compose',
  'promise-all-polyfill',
  'flatten-array-object',
  'group-by-count-by',
  'array-method-polyfills',
  'get-set-path',
  'deep-equal',
  'unique-sort-dedupe',
  'express-middleware-chain',
]);

/** All hand-written cases keyed by card id. */
export function loadCases() {
  const dupes = [p1, p2, p3].flatMap((p) => Object.keys(p)).filter((k, i, a) => a.indexOf(k) !== i);
  if (dupes.length) throw new Error(`Duplicate case ids: ${dupes.join(', ')}`);
  const all = { ...p1, ...p2, ...p3 };
  for (const id of NOW_VERIFIED) {
    all[id] = all[id].map(({ v, note, ...rest }) => rest);
  }
  for (const [id, list] of Object.entries(overrides)) {
    if (!all[id]) throw new Error(`override for unknown card ${id}`);
    all[id] = list;
  }
  for (const [id, list] of Object.entries(appends)) {
    if (!all[id]) throw new Error(`append for unknown card ${id}`);
    all[id] = [...all[id], ...list];
  }
  for (const [id, list] of Object.entries(newCards)) {
    if (all[id]) throw new Error(`new card ${id} already exists`);
    all[id] = list;
  }
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

const q = (s) => JSON.stringify(s);
const indent = (text, pad = '  ') =>
  text
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n');

/** Turns the machine-checkable cases into harness code using the `$test` helpers. */
export function generateHarness(list) {
  const blocks = [];
  for (const tc of list) {
    if (tc.v === false) continue;
    if (tc.logs) {
      blocks.push(
        `await $test.logs(${q(tc.d)}, async (console) => {\n  const sleep = $test.sleep;\n${indent(tc.i)}\n}, () => (${tc.ev ?? tc.e}));`
      );
      continue;
    }
    const lines = tc.i.split('\n');
    const expr = lines.pop();
    const body = `  const sleep = $test.sleep;\n${lines.length ? indent(lines.join('\n')) + '\n' : ''}  return (${expr});`;
    if (tc.t) blocks.push(`await $test.rejects(${q(tc.d)}, async () => {\n${body}\n}, ${q(tc.t)});`);
    else blocks.push(`await $test.run(${q(tc.d)}, async () => {\n${body}\n}, () => (${tc.ev ?? tc.e}));`);
  }
  return blocks.join('\n\n');
}
