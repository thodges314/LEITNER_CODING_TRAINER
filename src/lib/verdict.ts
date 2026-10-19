import type { EvaluationResult } from './ai';

/**
 * How a result was reached, for the result panel. The card's tests are the objective check: a failing test run is never a
 * pass. With an AI key the reviewer can additionally mark a passing run as needing revision (it can be wrong, so the
 * human override always exists).
 */
export interface VerdictSummary {
  tests: 'passed' | 'failed' | 'not-run';
  /** The AI reviewer's own verdict, or null when no AI review took part (offline). */
  reviewer: 'pass' | 'fail' | null;
  /** True when the tests passed but the AI reviewer still failed the answer. */
  aiOverruledTests: boolean;
}

export function summarizeVerdict(result: Pick<EvaluationResult, 'passed' | 'harness' | 'evaluationSource'>): VerdictSummary {
  const ran = Boolean(result.harness?.ran);
  const tests: VerdictSummary['tests'] = !ran ? 'not-run' : result.harness?.passed ? 'passed' : 'failed';
  const reviewer: VerdictSummary['reviewer'] = result.evaluationSource === 'api' ? (result.passed ? 'pass' : 'fail') : null;
  return { tests, reviewer, aiOverruledTests: tests === 'passed' && reviewer === 'fail' };
}
