/**
 * Feature switches. A parked feature keeps its code but is hidden from the UI.
 *
 * quickAdd: "Quick Add Topic with AI". PARKED: the AI writes both the reference solution and the tests and nothing
 * checks that they agree, so a draft can silently mark correct answers wrong. To bring it back, first merge the
 * verification work on branch `feature/quick-add-verified` (draft verifier + input/output-pair drafting) and
 * recommend a stronger model for drafting. See the roadmap, section "Parked features".
 */
export const FEATURES = {
  quickAdd: false,
} as const;
