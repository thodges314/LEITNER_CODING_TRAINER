// Temporary helper used while authoring card batches (deleted when finished).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const R = String.raw;
export function writeCards(cards, defaultTrack = 'algorithms') {
  const diffFile = path.join(here, 'difficulty.json');
  const cacheFile = path.join(here, 'complexity-cache.json');
  const ladder = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  for (const c of cards) {
    const dir = path.join(here, 'cards');
    fs.writeFileSync(path.join(dir, `${c.id}.meta.json`), JSON.stringify({ track: c.track || defaultTrack, title: c.title, tags: c.tags }, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
    fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
    if (c.extra) fs.writeFileSync(path.join(dir, `${c.id}.extra.js`), c.extra + '\n');
    ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
    cache[c.id] = { targetTime: c.cx[0], targetSpace: c.cx[1], complexityExplanation: c.cx[2] };
  }
  fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  console.log(`wrote ${cards.length} cards`);
}
