# Leitner Coding Trainer — Architecture and Technical Details

> **Notice:** This document provides the architecture, data flow, execution sandbox, spaced retrieval models, and editor engine details for the Leitner Coding Trainer. See also [ARCHITECTURE_AND_ROADMAP.md](ARCHITECTURE_AND_ROADMAP.md) and [README.md](README.md).

---

## 1. System Overview

A client-only, zero-backend deliberate practice environment designed to simulate cold-start front-end technical interview screening.
Learners write solutions from scratch without autocomplete or hints, execute their implementation headlessly in a browser sandbox against comprehensive test harnesses, and review cards according to spaced repetition schedules.

- **Frontend Core**: React 19, TypeScript (strict mode), Vite 8.
- **Code Editor**: CodeMirror 6 with rainbow bracket pair colorization, autoclosing brackets/quotes, and Prettier standalone formatting.
- **Persistence**: 100% browser-local (`localStorage`).
- **Test Runner & Sandbox**: In-page `AsyncFunction` sandbox injecting `$dom`, `$test`, and mock environments.

---

## 2. Editor & Aesthetics Engine

Located in [PracticeArena.tsx](src/components/PracticeArena.tsx):

### 2.1 CodeMirror 6 Integration
- Replaced basic HTML `<textarea>` with `@uiw/react-codemirror` and `@codemirror/lang-javascript`.
- Supports JavaScript (JSX) and TypeScript modes (`executionMode === 'ts'`).
- Line numbers, active line highlight, and custom dark-mode styling in [index.css](src/index.css).

### 2.2 Cold-Start Interview Integrity
- **Autocompletion & IntelliSense are strictly disabled**:
  ```tsx
  basicSetup={{
    autocompletion: false,
    completionKeymap: false,
    closeBrackets: true,
    closeBracketsKeymap: true,
    bracketMatching: true,
    tabSize: 2,
  }}
  ```
- No dropdown completions, parameter hints, or ghost text appear, guaranteeing authentic cold-start recall.

### 2.3 Bracket Colorization (Path B)
- Uses `rainbowbrackets` with tailored neon/pastel dark colors:
  - Red: `#f43f5e`
  - Orange: `#fb923c`
  - Yellow: `#facc15`
  - Green: `#4ade80`
  - Blue: `#38bdf8`
  - Indigo: `#818cf8`
  - Violet: `#c084fc`
- Nested brackets `()`, `[]`, `{}` dynamically receive depth-mapped colors.

### 2.4 Autoclosing Brackets & Quotes
- Autoclosing active for `()`, `[]`, `{}`, `""`, `''`, and `` ` ``.
- Jumping over closing tokens on typing and balanced deletion on Backspace.

### 2.5 In-Browser Code Formatter (Prettier Standalone)
- Located in [formatter.ts](src/lib/formatter.ts).
- Dynamically imports `prettier/standalone`, `@prettier/plugins/babel`, `estree`, and `typescript` as lazy chunks.
- Shortcuts:
  - `Shift + Alt + F` / `Cmd + Shift + F`: Auto-format code
  - `Cmd + Enter` / `Ctrl + Enter`: Run Code / Test
  - `Cmd + Shift + Enter` / `Ctrl + Shift + Enter`: Submit final answer
  - `Tab`: Indent with 2 spaces

---

## 3. Spaced Retrieval Algorithms

Located in [leitner.ts](src/lib/leitner.ts). Users can toggle their preferred algorithm in the Settings Modal:

### 3.1 Classic Leitner Boxes (`leitner`)
- **Boxes 1–5**: Review intervals in trial counts: `[1, 4, 10, 22, 45]`.
- **Pass Rule**: Promotes card to next box (`box + 1`, max 5).
- **Fail Rule**: Resets card to **Box 1** with streak 0, scheduled at setback interval `nextTotal + intervalForBox(1)`.
- **Immediate Reinforcement Drill**: Triggers an immediate practice drill on the failed card (see Section 3.3).

### 3.2 Graduated Interval Recall & Chaining (`graduated-interval`) — the default
- **Design intent (owner):** this is modelled on Pimsleur-style graduated-interval recall (expanding gaps, a small working chain of new items), which the owner has used successfully for languages; the original Leitner boxes were a misreading of what was wanted and are kept only as an alternative.
- **Tiers 1–9**: Geometric spaced review intervals: `Tier 1 (+1) • Tier 2 (+3) • Tier 3 (+7) • Tier 4 (+16) • Tier 5 (+35) • Tier 6 (+75) • Tier 7 (+165) • Tier 8 (+360) • Tier 9 (+800)`.
- **Dynamic Tier 10+ Scaling**: Dynamically continues geometric growth factor (~2.2x per tier, `Math.round(800 * Math.pow(2.2, tier - 9))`) so mastered cards continuously cycle on long maintenance intervals rather than stalling or hard-capping.
- **Active Deck Ceiling Guard**: If a calculated tier offset exceeds the active deck size $N$, the scheduled offset is safely capped to $N$ trials out so cards don't disappear past a full rotation through the deck.
- **Pass Rule**: Promotes card to next tier (`tier + 1`, extensible beyond Tier 5 into Tiers 6, 7, 8, 9, 10+).
- **Fail Rule**: Applies a half-tier setback `Math.max(1, Math.floor(currentTier / 2))` with streak reset to 0, scheduled at setback interval `nextTotal + intervalForBox(setbackTier, 'graduated-interval', activeDeckSize)`.
- **Immediate Reinforcement Drill**: Triggers an immediate practice drill on the failed card (see Section 3.3).
- **Active Working Memory Chaining**: Cards below Tier 5 form an active working chain (capacity 4). Once cards consolidate to Tier 5+, new unseen rungs enter the rotation.

### 3.3 Immediate Reinforcement Drill (Zero Stat Impact)
- **Why it exists (owner):** after a miss the learner sees the better answer and gets ONE immediate shot at reproducing it from memory to anchor it. It is deliberately outside scoring, so it must never change tier/box, streak or schedule. Do not "simplify" it into a normal retry.
- When a user commits a failed card review, the cold-start failure is recorded into deck statistics (applying the appropriate setback tier and scheduling its future recall trial).
- The trainer immediately launches into an isolated **Immediate Reinforcement Drill** for that card:
  - Editor reloads with a clean starter template and a distinct purple drill banner.
  - The user can practice, inspect the reference solution, and retest until they replicate the pattern correctly.
  - **Zero Stat Impact**: Repeating, retrying, and evaluating inside the drill does **not** alter the card's deck stats (tier/box, streak, or scheduled trial).
  - Once replicated, clicking **"Continue to Next Card"** advances to the next card in the deck, while the card's future trial remains safely scheduled at its setback interval.

---

## 4. Execution Sandbox & Grading Engine

Located in [runner.ts](src/lib/runner.ts):

1. **Transpilation & Loop Protection**:
   - JS Mode: Fast in-browser transformation via Sucrase.
   - TS Mode: Strict compile-time type diagnostics via lazy-loaded TypeScript compiler with ES2022 lib files.
   - **Loop Guard Protection** ([loopGuards.ts](src/lib/loopGuards.ts)): Automatically instruments all loops (`while`, `for`, `do..while`, `for..of`, `for..in`) with lightweight bitwise-checked iteration timers (`(++iter & 1023) === 0 && Date.now() - start > timeoutMs`). If code gets trapped in a synchronous infinite loop, it throws an informative timeout error after 3000ms, completely preventing browser freezing.
2. **Web Worker helper (`runWithTimeout`) — NOT used by the app yet**:
   - Located in [runner.ts](src/lib/runner.ts). It can run plain code in a dedicated Web Worker and `terminate()` it after `timeoutMs`.
   - Only its unit tests call it. Card grading (`runHarness`) runs in the **page itself**, so the only runaway protection today is the loop guard above:
     it stops synchronous `while/for` loops, but not runaway recursion (stack overflow is caught as an error), a loop that never reaches an instrumented
     statement, or an endless `await` chain. DOM harnesses need a `document`, so a real fix is a sandboxed iframe (see the roadmap, §7.3).
3. **Sandbox Scope**:
   - User code and harness concatenated in an `AsyncFunction`.
   - Injected globals: React, ReactDOM, native hooks, `$dom` (render, query, fire events, act, wait), `$test` (check, run, equal, rejects, sleep), mock `fetch`, mock `IntersectionObserver`.
4. **Verdict**:
   - Harness logs `PASS` and `FAIL` markers.
   - Submission passes if and only if harness logs ≥ 1 `PASS` and 0 `FAIL`/runtime errors.

---

## 5. AI Evaluator & Multi-Key Vault

Located in [ai.ts](src/lib/ai.ts) and [SettingsModal.tsx](src/components/SettingsModal.tsx):

- **Independent Multi-Key Storage**: Stores API keys per provider in an isolated vault in `localStorage` (`ai_evaluator_keys_vault`).
- **Instant 1-Click Provider Switching**: Users can switch between Gemini, Groq, OpenAI, OpenRouter, and Custom endpoints with a single click. The active provider's key is automatically loaded and activated.
- **Provider Status Badges**: The Settings UI displays badges indicating which providers have keys saved (`● Key Saved` vs `No Key`).
- **Prefix-Based Auto-Detection**: Automatically detects provider and default models upon key entry:
  - `gsk_` -> Groq (`llama-3.3-70b-versatile`)
  - `AIzaSy` -> Gemini (`gemini-2.5-flash`)
  - `sk-or-` -> OpenRouter (`anthropic/claude-3.5-sonnet`)
  - `sk-` -> OpenAI (`gpt-4o-mini`)

---

## 6. Timed Recall Mode

Located in [timedMode.ts](src/lib/timedMode.ts) and [PracticeArena.tsx](src/components/PracticeArena.tsx):

- **Configurable Durations**: 5m, 10m (default), 15m, and 20m options with persistent toggle in Settings.
- **Automatic Countdown**: When enabled, the countdown timer initiates automatically upon card mount.
- **Visual Status Indicator**: Displays a `TIMED` badge beside the stopwatch in the Practice Arena header card.
- **Auto-Submission on Expiry**: When the timer reaches 0:00, the arena automatically halts editing, submits the current buffer for test harness execution and AI evaluation, and displays a warning notification to the user.

---

## 7. Verification & Testing

- **Vitest Suite**: Tests verifying:
  - Reference solutions pass for all 234 topic cards (201 default + 33 in the optional `algorithms-advanced` pack).
  - Empty submissions fail for all cards.
  - Optional card packs (`src/lib/packs.test.ts`): off by default, excluded from scheduling and staged unlocks, persisted, core algorithms keep fair coverage.
  - Leitner and Graduated Interval algorithms, intervals, promotions, and setbacks.
  - Prettier standalone formatter for JS, JSX, TS, and syntax errors.
  - Multi-key vault persistence, prefix detection, and provider switching.
  - Timed Recall Mode configuration and persistence.
- **Browser smoke test** (`npm run e2e`, Playwright, real Chromium, production build): every card's reference solution must show PASSED and an empty buffer NEEDS REVISION. jsdom hides production-React and real-browser differences, so this is the gate for new or changed cards (see roadmap §7.4a).
- **Production Build**: Verified via `npm run build` (`tsc -b && vite build`) with zero lint or type errors.

## 8. Navigation and first-run welcome

- **Back button** (`src/lib/backNavigation.ts`, used by `App.tsx`): the history is `[guard entry, app entry]`. Back from a problem shows the deck and stays in the app
  (a fresh app entry is pushed straight away); a second Back within 2 s (`DOUBLE_BACK_WINDOW_MS`) leaves the app. On the deck, the first Back stays and shows
  "Press Back again to leave the app". View switches inside the app never touch the history. The decision logic is the pure function `decideBack`.
- **Opening screen**: the app always opens on the practice view (the next card); the deck is "one Back away".
- **First-run welcome** (`src/lib/welcome.ts`): a brand-new visitor (no saved deck, flag `leitner_welcomed` unset, not a narrow screen) sees `AboutModal` in
  `welcome` mode: a "How a session works" block and a "Start practicing" button on top of the usual About content. Dismissing it sets `leitner_welcomed`.
  Existing users (a saved deck) never see it. `isFirstVisit()` is evaluated once at module load, before the default deck is created and saved.
- Tests: `src/lib/backNavigation.test.ts`, `src/lib/welcome.test.ts`, and the real-browser `e2e/navigation.spec.ts`.
