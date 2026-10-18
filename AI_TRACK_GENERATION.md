# AI-generated tracks: evaluation and implementation plan

Status: **proposal, nothing built yet. Owner has pushed this way back on the list (low priority); do not start it unless asked.** Written 2026-10 for the owner and for any assistant who picks this up.
Related: roadmap §7.7 "Parked features" (Quick Add Topic), branch `feature/quick-add-verified`, `DELEGATION.md` task M.

## 1. The idea

A user types something like *"My interview covers PostgreSQL, write me a track for that"* and gets a whole track: an easy-to-hard ladder of
cards with real, runnable checks, scheduled by the normal Leitner machinery. This replaces the parked "Quick Add Topic" (one AI-drafted card at a time), which was weak
because nothing checked the AI's draft.

## 2. Verdict

**Feasible, in phases, and worth doing, but only with three guard rails:** (1) every generated card is machine-verified before it is saved, (2) the generator is
outline-first with a human review step, and (3) only topics that can actually run in the browser get verified cards.
The riskiest parts are the **data model** (tracks are hard-coded today) and the **runtime** (the grader only runs JS/TS today). Everything else reuses work that already exists.

| Piece | Effort | Risk | Reuses |
|---|---|---|---|
| A. Custom tracks and concepts in the data model | medium | **high** (touches saved decks) | packs, `mergeStoredWithSeed` |
| B. Generation pipeline (outline, draft, verify, repair, review) | medium-large | medium (model quality) | `feature/quick-add-verified` |
| C. SQL runtime and card type (needed for PostgreSQL) | large | medium | the `$test` harness style |
| D. UI: create flow, progress, review screen, export/import | medium | low | existing modals |

## 3. What exists today (checked in the code)

- **Tracks are a closed list.** `TRACK_METADATA` in `src/lib/leitner.ts` defines the 9 tracks (label, colors); `TrackType` is a TypeScript union of those ids and
  `TRACK_TYPES` is derived from it. `src/lib/tracks.test.ts` asserts "exactly 9 tracks" and "each concept lives in exactly one track". `TRACK_ALIASES` / `migrateTrackId` only
  handle *retired* ids.
- **Custom cards are second-class.** `mergeStoredWithSeed` keeps cards whose id is not in the seed untouched (progress normalised) and runs `migrateTrackId` on their track. There is no
  concept/ladder handling for them: `isLadderOpen` returns true for cards without a `concept`, so custom cards are never gated.
- **Packs already model "optional groups of cards"**: `CARD_PACKS`, `enabledPacks`, `visibleTopics`, `scheduleFilter`. A generated track maps naturally onto a user-owned pack.
- **The grader.** `src/lib/runner.ts` supports `ExecutionMode = 'js' | 'ts'` (Sucrase transpile). User code runs through `AsyncFunction` inside a Web Worker with a hard timeout,
  with a main-thread fallback when workers are unavailable. Harnesses call `$test.run / rejects / check` (and `$dom` for DOM/React cards). There is **no SQL engine or other runtime** in `package.json`.
- **AI plumbing.** `src/lib/ai.ts` talks to Gemini, Anthropic, OpenAI-compatible providers (Groq, Cerebras, Mistral, OpenRouter) with a key in `localStorage`. The (parked) `draftTopicWithAI` writes
  one card and nothing verifies it.
- **Verification pieces already written** on `feature/quick-add-verified` (`75393de`, tested): `caseHarness.ts` (builds a `$test` harness from explicit input -> expected pairs, the same
  format as the built-in cards) and `draftVerify.ts` (reference solution must pass, an empty solution must fail, needs at least 2 checks).
- **Storage.** The built-in deck is `src/data/topics.json` (about 1.9 MB, bundled). User progress is in `localStorage` (about 5 MB per origin). A 30-card generated track is roughly 150-300 KB, so it fits, but not unlimited tracks.

## 4. Design

### 4.1 Data model: custom tracks and concepts (piece A)

Goal: a generated track is a first-class, deletable, toggleable group that plays by the same rules as built-in tracks (ladders, difficulty, Focus, stats).

- Make track ids **strings** at runtime. Keep `TrackType` for built-in ids and add a `TrackId` type that accepts the built-in ids plus any string starting with `custom:`. Add `customTracks?: Record<string, { label, color, bg, border, source, createdAt }>` to `LeitnerDeckState`
  (and to `parseDeckBackup` / `saveDeckState`; **old backups without it must keep importing**).
- Every place that does `TRACK_METADATA[track]` needs a lookup helper that also reads `customTracks` (dashboard, Focus modal, badges, stats). Grep `TRACK_METADATA` and `TRACK_TYPES` first.
- Cards of a custom track carry `pack: 'custom:<trackId>'` so the existing pack switch (enable/disable) and `scheduleFilter` handle them, plus `concept` and `difficulty` so staged unlocks and ladders work unchanged.
- Update `tracks.test.ts` so the "exactly 9 tracks" rule applies to the **seed** only; add tests for custom tracks (ladders respect concepts, deleting a track removes its cards, migration of a saved deck, backup round-trip).
- **Conflict warning:** the stats-view task (J) also changes `LeitnerDeckState` and the backup parser (review history). Do not run both in parallel on the same files: merge stats first, then do this, or agree on one owner of `leitner.ts` changes.

### 4.2 Runtimes: what can be verified (piece C)

The core rule of the app is **tests decide pass/fail**. So a topic is only generatable as a *verified* track if it has a deterministic browser runtime.

| Topic family | Runtime | Verdict |
|---|---|---|
| JS, TS, DOM, React, Node-style utilities, algorithms | already supported | yes, available as soon as the pipeline exists (use these to prove the pipeline) |
| **PostgreSQL** | **PGlite** (Postgres compiled to WebAssembly; roughly a few MB gzipped, lazy-load it, verify size and licence before adopting) | yes, best fit: real Postgres semantics, so wrong expected rows from the AI are caught by actually running the query |
| Plain SQL / SQLite | sql.js (about 1 MB) | works, but dialect differs from Postgres (arrays, JSONB, `ILIKE`, `RETURNING`, `generate_series`, many types) |
| Python | Pyodide (10+ MB) | possible but heavy; not recommended for v1 |
| Docker, Kubernetes, AWS, Git, shell, system design | none | **cannot be machine-verified**. Offer only "explain" cards graded by AI (advisory, flagged *unverified*) or refuse. Do not pretend. |

Design for the SQL card type (mirrors the JS harness style, so it stays hand-readable):

```
setupSql:   CREATE TABLE orders (...); INSERT INTO orders VALUES (...);   -- per card, runs in a fresh schema per case
userCode:   the user's SQL (SELECT ... / maybe a function or view)
harness:    await $sql.run("Total per customer, highest first",
              "SELECT customer, SUM(total) AS total FROM orders GROUP BY customer ORDER BY total DESC",
              [{ customer: 'ada', total: 120 }, ...], { ordered: true });
```
- Comparison modes: `ordered` (rows must match in order) vs `unordered` (compare as sorted multisets); numeric/NULL/timestamp normalisation rules must be written down (dates and `numeric` come back as strings).
- Isolation: one PGlite instance per card run, `BEGIN ... ROLLBACK` per case, hard timeout (a bad `generate_series` can hang), no network, no filesystem. Run in the same Worker model as JS.
- `ExecutionMode` becomes `'js' | 'ts' | 'sql'` and the editor language follows (`@codemirror/lang-sql`).
- Because PGlite executes the **reference solution**, the verification step proves each card's expected rows are really what Postgres returns. This is a strong advantage over prose topics.

### 4.3 Generation pipeline (piece B)

Run once per track, with a strong model, in resumable stages. State is saved to `localStorage` after every stage so a crash, a closed tab or running out of credits loses at most one batch.

1. **Intake.** Topic text, level (screen vs deep), number of cards (default 20-30), which runtime (auto-detected, user can override), model. Refuse or downgrade non-runnable topics (see 4.2).
2. **Outline** (one call). The model returns concepts, a ladder per concept (difficulty 1-5 per the roadmap §7.4e rubric), card titles and one-line goals. The user edits or deletes entries before anything is drafted. This is where "don't generate things I don't need" happens and it is cheap.
3. **Draft in batches of 3-5 cards** (one call each, so output is never truncated). Each draft is JSON in the **input -> expected pairs** format: prompt, starter code, reference solution, `setupSql` where relevant, 5-8 cases `{ description, input, expected, throws? }`. The app builds the harness itself from the pairs (`caseHarness.ts`); small and mid models write test scripts badly but pairs reasonably well.
4. **Verify** each draft with the real runner: reference passes, empty solution fails, at least 2 checks (`draftVerify.ts`). Add a **model-written wrong-answer check**: ask for 2 plausible wrong solutions per card; the harness must reject both (cheap stand-in for the mutation check the hand-written cards get).
5. **Repair loop**, at most 2 rounds: send the model its own verification failure and ask for the corrected JSON. After that mark the card *failed* and drop it from the track unless the user keeps it.
6. **Dedupe and rate.** Reject cards that duplicate an existing card (same concept and near-identical prompt), clamp difficulties to the rubric, assign tags.
7. **Human review screen.** Show each card's prompt and its input/expected table (the app already renders this). Per card: keep, edit, regenerate, delete. Save only what the user kept, as one custom track + pack.

Model guidance: this feature should state clearly that a **stronger model is needed**; cheap models (`gpt-oss-120b` on Groq, `gemini-2.5-flash`) stay recommended for critiques only. Good candidates from the supported providers: Claude 3.5 Sonnet or newer, Gemini 2.5 Pro, GPT-4o or newer, Mistral Large.
Rough cost (estimate, check current prices): about 2-4k output tokens per card, so 25 cards plus repairs is on the order of 100-200k output tokens, i.e. a few dollars on a frontier model, paid once per track.

### 4.4 UX (piece D)

- Replace the hidden "Quick Add Topic" entry with **"Create a track"** in the Deck view. Steps: topic, outline review, generation progress (per-card status: drafting, verifying, repairing, passed, failed), review, done.
- Generated tracks appear in the catalog with an **AI-generated** badge and a **verified n/n** count; they can be disabled (pack switch), exported or deleted.
- **Export/import** a track as a JSON file (so a good track can be shared or backed up). **Imported tracks are untrusted code**: re-run verification on import, run only in the Worker (disable the main-thread `AsyncFunction` fallback for imported cards), and never auto-enable.
- Keep the existing warning that API keys live in `localStorage`.

## 5. Phased plan

| Phase | Deliverable | Done when |
|---|---|---|
| P0 | (done) verifier + pairs harness builder on `feature/quick-add-verified` | 15 unit tests pass |
| P1 | Custom tracks/concepts in the deck state, migration, tests | a hand-made custom track with a ladder works end to end; old saved decks and backups still load; `tracks.test.ts` split into seed rules vs custom rules |
| P2 | Pipeline for **JS/TS/DOM** tracks (no new runtime) + review screen | generate a small track (for example "Redux internals", 12 cards) with a strong model; every saved card verified; failed drafts reported honestly |
| P3 | SQL runtime and card type (PGlite), **pilot by hand first**: write 5 PostgreSQL cards manually to validate the harness and comparison rules before any AI generation | 5 cards pass the usual gates (reference passes, empty fails, mutation check) in Chromium |
| P4 | Enable SQL in the generator; PostgreSQL pilot track (about 20 cards); export/import | the review screen shows verified cards; a deliberately broken draft is rejected |
| P5 | Polish: cost estimate before generating, resume after reload, model recommendation notice | e2e test with a mocked provider covers outline, draft, repair and review |

Suggested split: P1 and the generation prompts are reasoning-heavy (keep with the owner / a strong assistant). P3's harness design should be done and reviewed by one assistant, then the UI parts (P2/P4/P5 screens) can go to Gemini against a written spec.
Everything that touches saved-deck shape (P1) needs the owner's review: see `DELEGATION.md` "Keep for the owner".

## 6. Risks and open questions

| Risk | Mitigation |
|---|---|
| Wrong or hallucinated content (a card teaches something false) | verification catches wrong *expected values* only where a runtime exists; the review screen is mandatory; label cards AI-generated; no auto-enable |
| Cheap model produces mostly failures | outline-first, small batches, 2-round repair, clear "use a stronger model" notice, drop failed cards instead of saving them |
| Saved-deck corruption or lost progress when adding custom tracks | additive fields only, backup round-trip tests, keep old fields readable, migrate lazily |
| `localStorage` limits with many tracks | cap tracks/cards, show size; consider IndexedDB later (a separate migration) |
| Runtime size slows the app | lazy-load PGlite only when a SQL card is opened or generated; never in the main bundle |
| Infinite loops or heavy queries | Worker + hard timeout (already the model for JS), statement timeout in SQL |
| Untrusted imported tracks | re-verify on import, Worker only, never auto-run on import |
| Duplicates with the built-in deck | dedupe step + concept ladder rules (one track per concept) |

Open questions for the owner:
1. Is PostgreSQL the first target, or should the pipeline be proven on a JS topic first (recommended: yes, prove it on JS/TS, then add SQL)?
2. Are non-runnable topics (Docker, system design) in scope as **unverified** "explain" cards, or out of scope?
3. Should a generated track be shareable (export/import) in v1, or local only?
4. Who owns `leitner.ts` changes while the stats view (task J) is in flight?
5. Budget cap: confirm a per-generation cost estimate shown before the user presses go.

## 7. First concrete steps (when this is picked up)

1. Merge the stats view first (or agree the file ownership), then start P1 on a branch from `master`.
2. Reuse `caseHarness.ts` and `draftVerify.ts` from `feature/quick-add-verified` (cherry-pick, they have no dependency on the old AI code).
3. Write the 5 hand-made PostgreSQL pilot cards **before** writing the generator; they define the harness and the comparison rules the generator must target.
4. Keep the claim table in `DELEGATION.md` current so two assistants never edit the same layer.
