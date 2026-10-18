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

// Difficulty ladder: scripts/difficulty.json maps id -> { difficulty 1-5, concept }.
// Seed status: a card starts active only if it is on the bottom rung of its concept AND difficulty <= 2.
const ladder = JSON.parse(fs.readFileSync(path.join(here, 'difficulty.json'), 'utf8'));
for (const t of topics) {
  const info = ladder[t.id];
  if (!info) throw new Error(`scripts/difficulty.json has no entry for "${t.id}"`);
  t.difficulty = info.difficulty;
  t.concept = info.concept;
}
for (const t of topics) {
  const lowest = Math.min(...topics.filter((o) => o.concept === t.concept).map((o) => o.difficulty));
  t.status = t.difficulty === lowest && t.difficulty <= 2 ? 'active' : 'locked';
}

// Optional card packs: scripts/packs.json maps pack name -> card ids. Cards in a pack are hidden from scheduling,
// unlocks and the catalog unless the pack is enabled in Settings (deck state `enabledPacks`).
const packs = JSON.parse(fs.readFileSync(path.join(here, 'packs.json'), 'utf8'));
const packOf = new Map();
for (const [pack, packIds] of Object.entries(packs)) {
  for (const id of packIds) {
    if (!topics.some((t) => t.id === id)) throw new Error(`scripts/packs.json: unknown card id "${id}" in pack "${pack}"`);
    packOf.set(id, pack);
  }
}
for (const t of topics) {
  if (packOf.has(t.id)) t.pack = packOf.get(t.id);
  else delete t.pack;
}

// Component cards: scripts/component-cards.json lists React problem IDs that render a component UI
// (distinguishing them from custom hooks and pure React logic).
const componentCards = JSON.parse(fs.readFileSync(path.join(here, 'component-cards.json'), 'utf8'));
const componentCardSet = new Set(componentCards);
for (const id of componentCards) {
  if (!topics.some((t) => t.id === id)) throw new Error(`scripts/component-cards.json: unknown card id "${id}"`);
}

let n = 0;
for (const t of topics) {
  if (!cases[t.id]) throw new Error(`No cases authored for ${t.id}`);

  const prompt = read(t.id, 'prompt.txt');
  if (prompt) t.promptSeed = prompt;

  const ref = read(t.id, 'ref.js');
  if (ref) {
    // One copy only: the app reads referenceSolution (readers fall back to solution/starterCode for old saved decks).
    t.referenceSolution = ref;
  }
  // Legacy duplicates: older data stored the same text three times. Keep a field only if it differs from referenceSolution.
  if (t.referenceSolution) {
    if (t.solution === t.referenceSolution) delete t.solution;
    if (t.starterCode === t.referenceSolution) delete t.starterCode;
  }

  t.testCases = toTestCaseItems(cases[t.id]);
  n += t.testCases.length;

  const manual = read(t.id, 'harness.js');
  const extra = read(t.id, 'extra.js');
  const generated = generateHarness(cases[t.id]);
  t.testHarness = manual ?? [generated, extra].filter(Boolean).join('\n\n');
  if (!t.testHarness.trim()) throw new Error(`Empty harness for ${t.id}`);

  const preview = read(t.id, 'preview.js');
  if (preview) {
    t.previewCode = preview;
  } else {
    delete t.previewCode;
  }

  // Card authors declare component rendering either via "rendersComponent: true"
  // in <id>.meta.json, by listing in scripts/component-cards.json, or by providing <id>.preview.js.
  const hasExplicitMeta = typeof t.rendersComponent === 'boolean';
  if (hasExplicitMeta) {
    if (!t.rendersComponent) {
      delete t.rendersComponent;
    }
  } else if (componentCardSet.has(t.id) || Boolean(t.previewCode)) {
    t.rendersComponent = true;
  } else {
    delete t.rendersComponent;
  }
}
fs.writeFileSync(file, JSON.stringify(topics, null, 2) + '\n');
console.log(`built ${topics.length} cards, ${n} test cases`);
