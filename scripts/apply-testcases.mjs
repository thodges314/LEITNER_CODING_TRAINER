// Writes the hand-written cases from scripts/testcases/ into src/data/topics.json (testCases field).
// Run `node scripts/verify-testcases.mjs` first. Only `testCases` is modified.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCases, toTestCaseItems } from './testcases/index.mjs';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/data/topics.json');
const topics = JSON.parse(fs.readFileSync(file, 'utf8'));
const cases = loadCases();
let n = 0;
for (const t of topics) {
  if (!cases[t.id]) throw new Error(`No cases authored for ${t.id}`);
  t.testCases = toTestCaseItems(cases[t.id]);
  n += t.testCases.length;
}
fs.writeFileSync(file, JSON.stringify(topics, null, 2) + '\n');
console.log(`wrote ${n} test cases across ${topics.length} cards`);
