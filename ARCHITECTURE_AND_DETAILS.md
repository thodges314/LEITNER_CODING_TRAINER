# Leitner Coding Trainer — Architecture and Technical Details

> **Notice:** This document provides the architecture, data flow, execution sandbox, spaced retrieval models, and editor engine details for the Leitner Coding Trainer. See also [ARCHITECTURE_AND_ROADMAP.md](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/ARCHITECTURE_AND_ROADMAP.md) and [README.md](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/README.md).

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

Located in [PracticeArena.tsx](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/src/components/PracticeArena.tsx):

### 2.1 CodeMirror 6 Integration
- Replaced basic HTML `<textarea>` with `@uiw/react-codemirror` and `@codemirror/lang-javascript`.
- Supports JavaScript (JSX) and TypeScript modes (`executionMode === 'ts'`).
- Line numbers, active line highlight, and custom dark-mode styling in [index.css](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/src/index.css).

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
- Located in [formatter.ts](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/src/lib/formatter.ts).
- Dynamically imports `prettier/standalone`, `@prettier/plugins/babel`, `estree`, and `typescript` as lazy chunks.
- Shortcuts:
  - `Shift + Alt + F` / `Cmd + Shift + F`: Auto-format code
  - `Cmd + Enter` / `Ctrl + Enter`: Run Code / Test
  - `Cmd + Shift + Enter` / `Ctrl + Shift + Enter`: Submit for Evaluation
  - `Tab`: Indent with 2 spaces

---

## 3. Spaced Retrieval Algorithms

Located in [leitner.ts](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/src/lib/leitner.ts). Users can toggle their preferred algorithm in the Settings Modal:

### 3.1 Classic Leitner Boxes (`leitner`)
- **Boxes 1–5**: Review intervals in trial counts: `[1, 4, 10, 22, 45]`.
- **Pass Rule**: Promotes card to next box (`box + 1`, max 5).
- **Fail Rule**: Complete reset to **Box 1** for immediate re-learning.

### 3.2 Graduated Interval Recall & Chaining (`graduated-interval`)
- **Tiers 1–7**: Exponential micro-spaced review intervals: `[1, 2, 5, 12, 28, 65, 150]`.
- **Pass Rule**: Promotes card to next tier (`tier + 1`, max 7).
- **Graduated Setback Rule**: On failure, resets to half its current tier (`Math.max(1, Math.floor(tier / 2))`). Preserves long-term memory progress without wiping all retention out.
- **Micro-Chaining Queue**: Cards with streak 0 (newly failed) or Tier 1 are prioritized at the front of the eligibility queue for immediate chaining reinforcement before longer intervals.

---

## 4. Execution Sandbox & Grading Engine

Located in [runner.ts](file:///Volumes/Claudet/thomashodges/Workspace/LEITNER_CODING_TRAINER/src/lib/runner.ts):

1. **Transpilation**:
   - JS Mode: Fast in-browser transformation via Sucrase.
   - TS Mode: Strict compile-time type diagnostics via lazy-loaded TypeScript compiler with ES2022 lib files.
2. **Sandbox Scope**:
   - User code and harness concatenated in an `AsyncFunction`.
   - Injected globals: React, ReactDOM, native hooks, `$dom` (render, query, fire events, act, wait), `$test` (check, run, equal, rejects, sleep), mock `fetch`, mock `IntersectionObserver`.
3. **Verdict**:
   - Harness logs `PASS` and `FAIL` markers.
   - Submission passes if and only if harness logs ≥ 1 `PASS` and 0 `FAIL`/runtime errors.

---

## 5. Verification & Testing

- **Vitest Suite**: 439 tests verifying:
  - Reference solutions pass for all 119 topic cards.
  - Empty submissions fail for all cards.
  - Leitner and Graduated Interval algorithms, intervals, promotions, and setbacks.
  - Prettier standalone formatter for JS, JSX, TS, and syntax errors.
- **Production Build**: Verified via `npm run build` (`tsc -b && vite build`) with zero lint or type errors.
