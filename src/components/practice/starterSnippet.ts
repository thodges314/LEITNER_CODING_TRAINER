// import { isReactTrack as isReactTrackId } from '../../lib/leitner';
import type { TopicItem } from '../../lib/leitner';

/** Blank lines between the "Write your implementation below" comment and the example checks. */
export const IMPLEMENTATION_GAP_LINES = 14;

export function getStarterSnippet(card: TopicItem | null): string {
  if (!card) return '';

  const gap = '\n'.repeat(IMPLEMENTATION_GAP_LINES + 1);
  const prefix = `// Write your implementation below${gap}`;

  const liveSnippet = card.testHarness?.trim();
  if (liveSnippet) {
    return `${prefix}// Test runner example:\n${liveSnippet}\n`;
  }

  return prefix;
}
