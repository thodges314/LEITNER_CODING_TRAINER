# Leitner Coding Trainer

A personal spaced-repetition trainer for cold-start coding practice. You rebuild a pattern
from a prompt (debounce, LRU cache, `usePrevious`, a discriminated-union exhaustiveness check, ...),
run it against a test harness, and the Leitner box system decides when the card comes back.

React 19 + TypeScript + Vite. Everything runs in the browser; progress lives in `localStorage`.

## Run it

```bash
npm install
npm run dev        # dev server
npm test           # vitest (scheduler, runner, harness parsing, seed cards)
npm run lint
npm run build      # type-check + production build into dist/
```

## How it works

- **Scheduling** (`src/lib/leitner.ts`): 5 boxes with trial-based intervals (+1, +4, +10, +22, +45 reviews).
  A pass promotes a card, a fail sends it back to box 1. Tracks are interleaved, and every 4 cards in
  box 3+ unlock 4 more locked cards.
- **Grading** (`src/lib/runner.ts`): on submit the card's test harness is run headlessly against your code.
  A card passes only if the harness logs at least one `PASS` and no `FAIL`/errors. An AI model (optional) adds
  critique but cannot override a failing harness. You can always override the verdict by hand
  (useful for harnesses that need the network).
- **Offline mode**: with no API key, grading is harness-only plus advisory structural notes.
- **TypeScript mode**: strict type-checking with the TypeScript compiler, loaded lazily on first use.
- **Persistence**: seed content from `src/data/topics.json` is merged into your stored deck on load. Progress is
  kept, content updates flow in, new seed cards are added, and seed cards you delete stay deleted.
  Use the dashboard to export/import JSON backups.

## AI evaluator (optional)

Settings accepts Gemini, OpenAI, Groq, OpenRouter, or any OpenAI-compatible endpoint. The key is stored in plain
text in this browser's `localStorage` and sent only to the provider you pick. Use a restricted key.

## Content

Cards live in `src/data/topics.json` (`promptSeed`, `starterCode`, `testHarness`, `referenceSolution`, `testCases`).
Harnesses report with `console.log('label:', cond ? 'PASS' : 'FAIL')`.

Helper scripts are in `scripts/`:

- `scripts/testcases/*.mjs` holds the hand-written input/output pairs for every card (the "Target Contract" table).
  `npm run verify:cases` runs each pair against the card's reference solution (fetch is mocked, timers are real) and lists
  the pairs that can't be machine-checked (React/DOM behaviour, type-level checks, features the reference solution lacks).
  `npm run apply:cases` writes them into `topics.json`. Only `testCases` is touched.
- `scripts/merge.cjs` merges `scripts/claude_topics.json` (extra drafted topics) into the seed file.
- `scripts/generate_all_fixtures.cjs` is a legacy generator that overwrites starter code and harnesses. **Do not run it**; it corrupts cards.

`src/lib/seedCards.test.ts` runs every offline seed harness against its reference solution, so a broken card fails the test run.
Harnesses that call the network are skipped there.

## Deploy

Pushing to `master` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`), after lint and tests pass.
