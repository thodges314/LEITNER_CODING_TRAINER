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
  `scripts/cards/<id>.{prompt.txt,ref.js,harness.js,extra.js}` hold prompts, reference solutions and hand-written harnesses.
  `npm run build:cards` regenerates `promptSeed`, the reference solution, `testCases` and `testHarness` in `topics.json`.
  Harnesses are generated from the cases (each case becomes one `$test.run(...)` assertion) unless a card has a
  hand-written `harness.js` (React/DOM cards), and `extra.js` appends type-level (`@ts-expect-error`) checks for TS cards.
- Harness globals: `$test` (`run`, `rejects`, `logs`, `check`, `equal`, `sleep`) and `$dom` (`render`, `renderHook`,
  `renderError`, `fire.click/change/keyDown/submit/focus`, `wait`, `q`, `qa`, `intersect`, `observers`). They render with
  the page's real DOM in the browser and jsdom in tests, with a mock `IntersectionObserver` and a deterministic `fetch`.
  Built-in prototypes patched by a solution (polyfill cards) are restored after each run.
- The old `generate_all_fixtures.cjs` generator was removed (it corrupted cards); cards are authored in `scripts/cards` and built with `npm run build:cards`.

`src/lib/seedCards.test.ts` runs every card's harness against its reference solution (must pass), checks that every documented
case is asserted under the same label, and checks that an empty solution does NOT pass.

## Deploy

Pushing to `master` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`), after lint and tests pass.
