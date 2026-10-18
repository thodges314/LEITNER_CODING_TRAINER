import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const topicsPath = path.resolve(__dirname, '../src/data/topics.json');
const cachePath = path.resolve(__dirname, './complexity-cache.json');

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: Please provide your API key via the GROQ_API_KEY or OPENAI_API_KEY environment variable:');
  console.error('  GROQ_API_KEY=your_key node scripts/enrich-complexities.mjs');
  process.exit(1);
}
const model = 'openai/gpt-oss-120b';

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));

// Big-O only means something for algorithmic / data-structure style cards. UI components, hooks, TS types and
// plain language features get NO complexity fields (the UI hides the complexity badges for them).
// Algorithms, plus the data-structure style concepts of the JS Utilities track.
const COMPLEXITY_CONCEPTS = new Set(['collections', 'flatten', 'array-polyfills', 'equality-clone', 'lru']);
const wantsComplexity = (card) => card.track === 'algorithms' || (card.track === 'js-utilities' && COMPLEXITY_CONCEPTS.has(card.concept));
// One notation everywhere: lowercase variables (O(n), O(n log n)), so the card UI is consistent.
const normalizeBigO = (text) => (typeof text === 'string' ? text.replace(/\bN\b/g, 'n') : text);
console.log(`Loaded ${topics.length} topics`);

let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {}
}

// Seed cache with any cards already evaluated
const initialSeed = {
  'async-fetch-error-handling': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Parsing response JSON dominates, requiring linear time and space.' },
  'fetch-abort-controller': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Constant-time setup and cleanup around an async fetch.' },
  'promise-chaining-syntax': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Parsing fetched JSON dominates time and memory.' },
  'promise-all-vs-settled': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Each URL is processed once, requiring linear work and storage.' },
  'debounce-implementation': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Constant-time timer operations and state storage.' },
  'event-loop-microtasks': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Fixed number of constant-time queue scheduling operations.' },
  'map-frequency-counter': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Each element processed once with constant-time Map operations.' },
  'throttle-implementation': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Constant-time flag checks and timer management.' },
  'set-unique-operations': { targetTime: 'O(n + m)', targetSpace: 'O(n + m)', complexityExplanation: 'Scans both input collections once and stores unique elements.' },
  'custom-array-reduce': { targetTime: 'O(n)', targetSpace: 'O(1)', complexityExplanation: 'Iterates each element once with constant extra memory.' },
  'array-flatten-recursive': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Visits each element once and produces a flat array.' },
  'object-deep-clone': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Visits each property once to clone, linear in total elements.' },
  'lru-cache-implementation': { targetTime: 'O(1)', targetSpace: 'O(capacity)', complexityExplanation: 'Hash map lookups with doubly linked list updates yield O(1) ops.' },
  'hook-use-debounce': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Each render schedules a single timeout and clears the previous one.' },
  'hook-use-previous': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Effect and ref updates run in constant time.' },
  'use-reducer-todo-list': { targetTime: 'O(n)', targetSpace: 'O(n)', complexityExplanation: 'Reducer actions scan and copy the todo list of size n.' },
  'infinite-scroll-observer': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'IntersectionObserver setup and callback perform constant work.' },
  'context-provider-consumer': { targetTime: 'O(1)', targetSpace: 'O(1)', complexityExplanation: 'Constant-time React Context state access and update.' },
};

cache = { ...initialSeed, ...cache };

async function analyzeCard(card) {
  if (cache[card.id]) {
    return cache[card.id];
  }

  const prompt = `You are an expert algorithm and software complexity analyst.
Analyze the following coding topic, its instructions, and its canonical reference solution.
Determine the optimal target Time Complexity and Space Complexity for an ideal implementation.
For UI components, hooks, or DOM utility cards where traditional asymptotic N does not apply, use 'O(1)' or 'N/A' or descriptive standard bounds.

Topic: ${card.title} (Track: ${card.track})
Prompt / Instructions:
${card.promptSeed}

Reference Solution:
${card.referenceSolution || card.solution || card.starterCode || ''}

Respond with strictly valid JSON in this exact structure:
{
  "targetTime": "O(...)",
  "targetSpace": "O(...)",
  "complexityExplanation": "concise 1-sentence explanation"
}`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const waitMs = 5000 * attempt;
          console.log(`[Rate limit 429] Pausing ${waitMs / 1000}s for "${card.id}"...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw new Error(`API ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      const res = {
        targetTime: String(parsed.targetTime || 'O(n)'),
        targetSpace: String(parsed.targetSpace || 'O(1)'),
        complexityExplanation: String(parsed.complexityExplanation || ''),
      };
      cache[card.id] = res;
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
      return res;
    } catch (err) {
      if (attempt === 6) {
        console.error(`Failed ${card.id}:`, err.message);
        return { targetTime: 'O(n)', targetSpace: 'O(1)', complexityExplanation: 'Standard bound.' };
      }
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

console.log(`Starting sequential analysis with rate-pacing (${Object.keys(cache).length} cached)...`);
for (let i = 0; i < topics.length; i++) {
  const card = topics[i];
  if (!wantsComplexity(card)) continue;
  const isCached = Boolean(cache[card.id]);
  const res = await analyzeCard(card);
  console.log(`[${i + 1}/${topics.length}] ${card.id} -> Time: ${res.targetTime} | Space: ${res.targetSpace}${isCached ? ' [cached]' : ''}`);
  if (!isCached) {
    // Pace requests by 1200ms to stay well below Groq 30 RPM limit
    await new Promise((r) => setTimeout(r, 1200));
  }
}

const updatedTopics = topics.map((t) => {
  const { targetTime, targetSpace, complexityExplanation, ...rest } = t;
  const info = cache[t.id];
  if (info && wantsComplexity(t)) {
    return {
      ...rest,
      targetTime: normalizeBigO(info.targetTime),
      targetSpace: normalizeBigO(info.targetSpace),
      complexityExplanation: normalizeBigO(info.complexityExplanation),
    };
  }
  return rest;
});

fs.writeFileSync(topicsPath, JSON.stringify(updatedTopics, null, 2) + '\n', 'utf8');
console.log(`\nSuccessfully updated all ${updatedTopics.length} cards in ${topicsPath}!`);
