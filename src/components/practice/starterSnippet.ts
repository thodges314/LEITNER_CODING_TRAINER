import { getCardInputLanguage } from '../../lib/leitner';
import type { TopicItem } from '../../lib/leitner';
import { getCardPreloadedScopeInfo } from '../../utils/cardPromptTypes';

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
  if (scopeInfo.allItems.length > 0) {
    return `// Preloaded in scope: ${scopeInfo.allItems.join(', ')}\n\n`;
  }

  return '';
}
