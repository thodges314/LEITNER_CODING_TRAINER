# Comprehensive TypeScript Support & Dual-Solution Architecture

## 1. Vision & Core Philosophy

The Leitner Coding Trainer aims to provide first-class support for both **JavaScript runtime mastery** (closures, prototypes, event loop, dynamic DOM) and **TypeScript engineering excellence** (strict typing, generics, interfaces, discriminated unions).

### Core Principles
1. **JavaScript is a Permanent First-Class Citizen:** JavaScript solutions are never deprecated or obscured with ugly `as any` type workarounds. Pure prototype and dynamic metaprogramming cards remain JS-first.
2. **Context-Aware Solution Reveal:** When a user clicks *"Reveal Suggested Solution"*, they see the solution in the language mode they practiced in:
   - **JS Mode (`executionMode === 'js'`)** $\rightarrow$ Clean, idiomatic JavaScript (`referenceSolution`).
   - **TS Mode (`executionMode === 'ts'`)** $\rightarrow$ Strongly typed TypeScript (`referenceSolutionTs`), with graceful fallback to JS if a card does not have a dedicated TS implementation.
3. **No Implicit `any` Friction:** Users in TS mode should never be greeted with empty buffers that trigger `TS7006: Parameter implicitly has an 'any' type` on their first line of code.
4. **Concrete Contracts:** Test contracts represent concrete runtime input/output pairs (`twoSum([2, 7], 9) => [0, 1]`). Function type signatures define the target shape; individual contract rows remain clean execution examples.

---

## 2. What About the Test Contracts?

The app features a **Target Contract: Input vs Expected Output** table on every card derived from `card.testCases` / `extractHarnessContracts(card.testHarness)`.

### Do Contract Rows Need Type Annotations?
**No.** The contract rows display **concrete execution instances**, not abstract types:
- **Correct row representation:**  
  Input: `fib(10)` $\rightarrow$ Expected: `55`  
  Input: `twoSum([2, 7, 11, 15], 9)` $\rightarrow$ Expected: `[0, 1]`
- Adding inline types into example calls (e.g., `twoSum([2, 7]: number[], 9: number)`) makes runtime examples unreadable and syntactically invalid.

### Enhancing the Contract Header with Type Signatures
Instead of cluttering individual test cases, the contract section and problem descriptions will be enhanced with the **Target Function Signature**:
- **Problem Description Heading:**
  ```markdown
  ### `twoSum(nums: number[], target: number): [number, number]`
  ```
- **Contract Header / Callout (in TS mode):**
  Displays the canonical TypeScript interface/signature directly above the test cases table, giving users the exact contract shape before viewing individual scenario rows.

---

## 3. Architecture & Data Flow

```
                                  scripts/cards/
                         ┌──────────────┬──────────────┐
                         │   <id>.ref.js│  <id>.ref.ts │
                         └──────┬───────┴──────┬───────┘
                                │              │
                   npm run build:cards (build-cards.mjs)
                                │              │
                                ▼              ▼
                      t.referenceSolution   t.referenceSolutionTs
                                │              │
                                └──────┬───────┘
                                       ▼
                              src/data/topics.json
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
           JS Mode in Playground             TS Mode in Playground
           ├── JS Starter Buffer             ├── Typed Function Stub
           ├── JS Runtime Execution          ├── Strict tsc Check + Sucrase Transpile
           └── Reveals: referenceSolution    └── Reveals: referenceSolutionTs
```

### Schema Changes
In `src/lib/leitner.ts`:
```ts
export interface TopicItem {
  // ... existing fields
  referenceSolution?: string;     // Canonical JavaScript solution
  referenceSolutionTs?: string;   // Canonical TypeScript solution (optional)
}
```

### Build Pipeline Updates
In `scripts/build-cards.mjs`:
```js
const refTs = read(t.id, 'ref.ts');
if (refTs) {
  t.referenceSolutionTs = refTs;
}
```

### Ambient Types in Sandbox
In `src/utils/typeChecker.ts`, expand `SANDBOX_GLOBALS` (`sandbox-globals.d.ts`) to include common data structures used across algorithm and structure cards:
```ts
declare class ListNode<T = number> {
  val: T;
  next: ListNode<T> | null;
  constructor(val?: T, next?: ListNode<T> | null);
}

declare class TreeNode<T = number> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  constructor(val?: T, left?: TreeNode<T> | null, right?: TreeNode<T> | null);
}
```

---

## 4. Phased Implementation Roadmap

### Phase 1: Infrastructure & Plumbing (Zero Risk to Existing Cards)
- [ ] Add `referenceSolutionTs` to `TopicItem` in `src/lib/leitner.ts`.
- [ ] Update `scripts/build-cards.mjs` to ingest `<id>.ref.ts` when present.
- [ ] Add ambient types (`ListNode`, `TreeNode`) to `src/utils/typeChecker.ts`.
- [ ] Pass `executionMode` to `EvaluationPanel.tsx` and display `referenceSolutionTs` when `executionMode === 'ts'` (with graceful fallback to `referenceSolution`).
- [ ] Add a clean language badge (`TypeScript` or `JavaScript`) in the solution reveal modal.

### Phase 2: Typed Starter Stubs & Contract Signatures
- [ ] Update `src/components/practice/starterSnippet.ts` to accept `mode: 'js' | 'ts'`.
- [ ] In TS mode, extract the top-level function/component signature from `referenceSolutionTs` to seed the editor with an initial typed stub.
- [ ] Enhance prompt instruction headings with typed signatures where appropriate (e.g. `### fn(arg: Type): ReturnType`).

### Phase 3: Phased Content Rollout (Batching by Track)
Author and verify `.ref.ts` solutions incrementally:
1. **Batch 1: Algorithms (53 cards)**
   - High value; clean, unambiguous type signatures for arrays, two-pointer, trees, heaps, dynamic programming, and graphs.
2. **Batch 2: React Components & Custom Hooks (62 cards)**
   - Props interfaces (`interface ButtonProps`), state hooks (`usePrevious<T>`, `useLocalStorage<T>`).
3. **Batch 3: JS Utilities & Async Functions (64 cards)**
   - Typed utility functions with generic constraints (`debounce<F>`, `deepClone<T>`, `pool<T>`).
4. **Batch 4: JS Language Mechanics (25 cards)**
   - Targeted evaluation: provide TypeScript solutions only where idiomatic, preserving pure JavaScript for prototype and dynamic proxy mechanics.
