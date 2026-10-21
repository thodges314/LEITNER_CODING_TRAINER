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

### Phase 1: Infrastructure & Plumbing (COMPLETED in `1aa7e91`)
- [x] Add `referenceSolutionTs?: string` to `TopicItem` in `src/lib/leitner.ts`.
- [x] Update `scripts/build-cards.mjs` to ingest `<id>.ref.ts` into `topic.referenceSolutionTs`.
- [x] Add ambient types (`ListNode<T>`, `TreeNode<T>`) to `SANDBOX_GLOBALS` in `src/utils/typeChecker.ts`.
- [x] Pass `executionMode` to `EvaluationPanel.tsx` and dynamically display `referenceSolutionTs` when `executionMode === 'ts'` (with graceful fallback to `referenceSolution`).
- [x] Add language indicator badge (`TypeScript` blue badge vs `JavaScript` amber badge) in `EvaluationPanel.tsx`.
- [x] Add automated unit tests for mode-aware solution rendering in `src/components/EvaluationPanel.test.tsx`.

### Phase 2: Typed Signatures & Editor Buffer Architecture (COMPLETED & CLARIFIED)
- [x] **Cold-Start Buffer Decision (Preserved):** Editor buffer is intentionally NOT overwritten or injected with starter stubs upon toggling between JS and TS modes. Overwriting the buffer harms cold-start recall and risks destroying work in progress.
- [x] **Typed Prompt Headings:** Problem statements provide explicit TypeScript signatures in headings (e.g. `### twoSum(nums: number[], target: number): [number, number]`), giving learners exact parameter and return contracts without needing editor stubs.
- [x] **Full TypeScript Hover Tooltips (QuickInfo):** Built via `@codemirror/view`'s `hoverTooltip` and TypeScript's `ts.createLanguageService(host).getQuickInfoAtPosition`. Provides full type signatures, parameter inspection, and ambient class declarations (`ListNode`, `TreeNode`) on mouse hover. Lazily loaded and active strictly in `executionMode === 'ts'` to maintain zero overhead in JS mode. Styled with high-contrast dark card aesthetics.

### Phase 3: Content Rollout & Dual Solutions
Author and verify `.ref.ts` solutions and typed prompt headings incrementally across batches:
1. **Batch 1: Foundational Algorithms (8 cards — COMPLETED in `6cefd46`)**
   - `binary-search-exact`: `binarySearch(nums: number[], target: number): number`
   - `two-pointer-sorted-sum`: `twoSumSorted(numbers: number[], target: number): [number, number]`
   - `sliding-window-fixed`: `maxSubarraySum(nums: number[], k: number): number`
   - `valid-parentheses-stack`: `isValidParentheses(s: string): boolean`
   - `merge-intervals`: `mergeIntervals(intervals: [number, number][]): [number, number][]`
   - `two-sum-hashmap`: `twoSum(nums: number[], target: number): [number, number]`
   - `interval-overlap`: `hasOverlap(intervals: [number, number][]): boolean`
   - `anagram-palindrome`: `isAnagram(s: string, t: string): boolean` and `isPalindrome(s: string): boolean`
2. **Batch 2: Tree & Graph Algorithms (Upcoming next)**
   - Tree navigation & manipulation using ambient `TreeNode<T>`: `bst-search-insert`, `bst-validate-lca-invert`, `tree-depth-sum`, `tree-diameter-balanced`, `tree-level-order`, `tree-max-path-sum`, `tree-path-sum`, `tree-build-serialize`, `tree-traversal-dom`.
3. **Batch 3: Linked Lists, Stacks & Heaps**
   - Linked lists using ambient `ListNode<T>`: `linked-list-cycle-merge`, `reverse-linked-list`, `list-add-numbers`, `list-remove-reorder`, `min-stack`, `min-heap-class`, `heap-kth-largest`.
4. **Batch 4: React Components & Custom Hooks**
   - Props interfaces (`interface ButtonProps`), typed generics (`usePrevious<T>`, `useLocalStorage<T>`, `useIsMounted`).
5. **Batch 5: JS Utilities & Async Plumbing**
   - Generic utility constraints (`debounce<F>`, `deepClone<T>`, `pool<T>`, `promise-all-by-hand`).
6. **Batch 6: Language Mechanics Evaluation**
   - Targeted evaluation: provide TypeScript solutions only where idiomatic, preserving pure JavaScript for prototype and dynamic proxy mechanics.
