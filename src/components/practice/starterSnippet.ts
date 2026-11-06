import { getCardInputLanguage } from '../../lib/leitner';
import type { TopicItem } from '../../lib/leitner';
import { getCardPreloadedScopeInfo } from '../../utils/cardPromptTypes';

/** Blank lines between the "Write your implementation below" comment and the example checks. */
export const IMPLEMENTATION_GAP_LINES = 14;

export function getStarterSnippet(card: TopicItem | null): string {
  if (!card) return '';

  const inputLang = getCardInputLanguage(card);
  if (inputLang === 'html') {
    return card.starterCode?.trim() || '<!-- Write your HTML markup below -->\n\n';
  }
  if (inputLang === 'sql') {
    return card.starterCode?.trim() || '-- Write your SQL query below\n\n';
  }
  if (inputLang === 'graphql') {
    return card.starterCode?.trim() || '# Write your GraphQL query or schema below\n\n';
  }

  const scopeInfo = getCardPreloadedScopeInfo(card);
  const scopeLine =
    scopeInfo.allItems.length > 0
      ? `\n// Preloaded in scope: ${scopeInfo.allItems.join(', ')}`
      : '';

  const gap = '\n'.repeat(IMPLEMENTATION_GAP_LINES + 1);
  const prefix = `// Write your implementation below${scopeLine}${gap}`;

  const liveSnippet = card.testHarness?.trim();
  if (liveSnippet) {
    return `${prefix}// Test runner example:\n${liveSnippet}\n`;
  }

  return prefix;
}
