// Read-only TypeScript coverage report: node scripts/report-ts.mjs   (npm run report:ts)
// Counts, per track, how many cards have a TypeScript reference solution (scripts/cards/<id>.ref.ts, ingested
// into topics.json as referenceSolutionTs). Use these numbers in the docs instead of hand-counting.
// `--check` exits 1 when the numbers in TYPESCRIPT_SUPPORT_PLAN.md disagree with the real totals.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'src/data/topics.json'), 'utf8'));

// Cards in these tracks are TypeScript-only topics: the app forces TS mode for them (see runner.ts).
const TS_ONLY_TRACKS = new Set(['typescript-patterns']);

const tracks = new Map();
for (const t of topics) {
  const row = tracks.get(t.track) ?? { total: 0, done: 0, missing: [] };
  row.total++;
  if (t.referenceSolutionTs?.trim()) row.done++;
  else row.missing.push(t.id);
  tracks.set(t.track, row);
}

const total = topics.length;
const done = [...tracks.values()].reduce((n, r) => n + r.done, 0);
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : '0.0');

console.log('track'.padEnd(22), 'total'.padStart(5), 'with .ref.ts'.padStart(13), '%'.padStart(7));
for (const [track, r] of [...tracks].sort((a, b) => b[1].done / b[1].total - a[1].done / a[1].total)) {
  const tag = TS_ONLY_TRACKS.has(track) ? ' (TS-only)' : '';
  console.log(`${track}${tag}`.padEnd(22), String(r.total).padStart(5), String(r.done).padStart(13), pct(r.done, r.total).padStart(7));
}
console.log('TOTAL'.padEnd(22), String(total).padStart(5), String(done).padStart(13), pct(done, total).padStart(7));

const problems = [];
for (const t of topics) {
  if (TS_ONLY_TRACKS.has(t.track) && !t.referenceSolutionTs?.trim()) problems.push(`${t.id}: TS-only card has no .ref.ts`);
  if (t.referenceSolutionTs?.trim() && !/^###.*\(.*\).*:/m.test(t.promptSeed ?? '')) {
    problems.push(`${t.id}: has .ref.ts but the prompt heading may lack typed signature (arg: Type): Return`);
  }
}
if (problems.length) {
  console.log(`\nNotes (${problems.length}):`);
  for (const p of problems) console.log(`  - ${p}`);
}

console.log(`\nRemaining (${total - done}):`);
for (const [track, r] of tracks) if (r.missing.length) console.log(`  ${track}: ${r.missing.join(', ')}`);

if (process.argv.includes('--check')) {
  const plan = fs.readFileSync(path.join(root, 'TYPESCRIPT_SUPPORT_PLAN.md'), 'utf8');
  const m = plan.match(/Fully Typed Cards Completed:\*\*\s*\*\*(\d+)\s*\/\s*(\d+)/);
  if (!m || Number(m[1]) !== done || Number(m[2]) !== total) {
    console.error(`\nTYPESCRIPT_SUPPORT_PLAN.md says ${m ? `${m[1]}/${m[2]}` : '(no figure found)'}, real figure is ${done}/${total}. Update the plan.`);
    process.exit(1);
  }
  console.log('\nTYPESCRIPT_SUPPORT_PLAN.md matches.');
}
