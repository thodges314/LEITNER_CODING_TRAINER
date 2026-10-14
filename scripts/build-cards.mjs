// Rebuilds the generated parts of src/data/topics.json from scripts/cards/ and scripts/testcases/:
//   promptSeed                              <- scripts/cards/<id>.prompt.txt            (optional)
//   referenceSolution/solution/starterCode  <- scripts/cards/<id>.ref.js                (optional)
//   testCases                               <- scripts/testcases/*.mjs
//   testHarness                             <- scripts/cards/<id>.harness.js            (hand-written, replaces generation)
//                                              or generated from the cases + scripts/cards/<id>.extra.js
// Run: npm run build:cards   (then npm test to check every reference solution passes its own harness)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCases, toTestCaseItems, generateHarness } from './testcases/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, '..', 'src/data/topics.json');
const topics = JSON.parse(fs.readFileSync(file, 'utf8'));
const cases = loadCases();
const read = (id, suffix) => {
  const p = path.join(here, 'cards', `${id}.${suffix}`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\s+$/, '') : null;
};

// New cards are declared by scripts/cards/<id>.meta.json ({ track, title, tags }); existing cards may use a
// meta file to override title/tags/track. New cards start locked, at the end of the deck.
const metaFiles = fs.readdirSync(path.join(here, 'cards')).filter((f) => f.endsWith('.meta.json'));
for (const f of metaFiles) {
  const id = f.replace(/\.meta\.json$/, '');
  const meta = JSON.parse(fs.readFileSync(path.join(here, 'cards', f), 'utf8'));
  const existing = topics.find((t) => t.id === id);
  if (existing) Object.assign(existing, meta);
  else {
    for (const k of ['track', 'title', 'tags']) if (!meta[k]) throw new Error(`${f}: missing "${k}"`);
    topics.push({
      id,
      track: meta.track,
      title: meta.title,
      box: 1,
      streak: 0,
      nextEligibleTrial: 0,
      status: 'locked',
      tags: meta.tags,
      promptSeed: '',
    });
  }
}

let n = 0;
for (const t of topics) {
  if (!cases[t.id]) throw new Error(`No cases authored for ${t.id}`);

  const prompt = read(t.id, 'prompt.txt');
  if (prompt) t.promptSeed = prompt;

  const ref = read(t.id, 'ref.js');
  if (ref) {
    t.referenceSolution = ref;
    t.solution = ref;
    t.starterCode = ref;
  }

  t.testCases = toTestCaseItems(cases[t.id]);
  n += t.testCases.length;

  const manual = read(t.id, 'harness.js');
  const extra = read(t.id, 'extra.js');
  const generated = generateHarness(cases[t.id]);
  t.testHarness = manual ?? [generated, extra].filter(Boolean).join('\n\n');
  if (!t.testHarness.trim()) throw new Error(`Empty harness for ${t.id}`);
}
fs.writeFileSync(file, JSON.stringify(topics, null, 2) + '\n');
console.log(`built ${topics.length} cards, ${n} test cases`);
