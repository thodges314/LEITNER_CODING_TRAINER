import { runHarness } from './runner';
import type { TopicItem } from './leitner';

/**
 * - verified:        the reference solution passes its tests AND an empty solution does not.
 * - reference-fails: the drafted reference solution fails (or cannot run) its own tests.
 * - lenient:         the tests pass even with no solution at all, so they prove nothing.
 * - no-tests / no-reference: there is nothing to check yet (or too few checks to mean anything).
 * - template:        a placeholder to fill in by hand (no AI draft was produced).
 */
export type DraftVerificationStatus = 'verified' | 'reference-fails' | 'lenient' | 'no-tests' | 'no-reference' | 'template';

export interface DraftVerification {
  status: DraftVerificationStatus;
  /** Human-readable explanation; also fed back to the AI when asking it to repair a draft. */
  detail: string;
  /** Number of checks that passed for the reference solution. */
  checks: number;
}

export const MIN_CHECKS = 2;

export interface DraftToVerify {
  track: TopicItem['track'];
  referenceSolution?: string;
  testHarness?: string;
}

/** Runs the draft's reference solution and an empty solution against the draft's own tests. */
export async function verifyDraft(draft: DraftToVerify): Promise<DraftVerification> {
  const harness = draft.testHarness?.trim();
  const reference = draft.referenceSolution?.trim();
  if (!harness) return { status: 'no-tests', detail: 'The draft has no tests to run.', checks: 0 };
  if (!reference) return { status: 'no-reference', detail: 'The draft has no reference solution to check the tests against.', checks: 0 };

  const card = { id: 'draft-check', track: draft.track, testHarness: harness } as TopicItem;

  const ref = await runHarness(card, reference, 'js', 6000);
  if (!ref.passed) {
    const failing = ref.lines.filter((l) => /FAIL|error/i.test(l)).slice(0, 3).join(' | ');
    const why = ref.timedOut ? 'it timed out' : failing || ref.summary;
    return { status: 'reference-fails', detail: `The reference solution does not pass its own tests (${why}).`, checks: ref.passCount };
  }
  if (ref.passCount < MIN_CHECKS) {
    return { status: 'no-tests', detail: `The tests only contain ${ref.passCount} check; at least ${MIN_CHECKS} are needed to mean anything.`, checks: ref.passCount };
  }

  const empty = await runHarness(card, '', 'js', 6000);
  if (empty.passed) {
    return { status: 'lenient', detail: 'The tests also pass with no solution at all, so they would accept a wrong answer.', checks: ref.passCount };
  }
  return { status: 'verified', detail: `The reference solution passes ${ref.passCount} checks and an empty solution fails them.`, checks: ref.passCount };
}
