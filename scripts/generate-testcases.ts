// Fills in structured `testCases` for seed topics that lack them, derived from each card's
// harness assertions. Run with: npx vite-node scripts/generate-testcases.ts
// Cards that already have testCases are never touched. Review the diff before committing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTopicTestCases } from '../src/lib/leitner';
import type { TopicItem } from '../src/lib/leitner';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/data/topics.json');
const topics = JSON.parse(fs.readFileSync(file, 'utf8')) as TopicItem[];

const GENERIC = /\(\.\.\.\)$|^Default Example Contract$|^Contract Validation$/;
let filled = 0;
let skipped = 0;

for (const t of topics) {
  if (t.testCases && t.testCases.length > 0) continue;
  const cases = getTopicTestCases(t);
  const useful = cases.filter((c) => !GENERIC.test(c.input) && !GENERIC.test(c.description ?? ''));
  if (useful.length === 0) {
    skipped++;
    console.warn(`skip ${t.id}: no assertions could be derived`);
    continue;
  }
  t.testCases = useful;
  filled++;
}

fs.writeFileSync(file, JSON.stringify(topics, null, 2) + '\n');
console.log(`testCases filled: ${filled}, skipped: ${skipped}, total: ${topics.length}`);
