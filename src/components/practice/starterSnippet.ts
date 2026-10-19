import { isReactTrack as isReactTrackId } from '../../lib/leitner';
import type { TopicItem } from '../../lib/leitner';

/** Blank lines between the "Write your implementation below" comment and the example checks. */
export const IMPLEMENTATION_GAP_LINES = 14;

/**
 * Constructs the default starter code template: an empty implementation area followed by the card's own example
 * checks as live (uncommented) code, tailored to the card and its track. Cards without a harness get a commented hint.
 */
export function getStarterSnippet(card: TopicItem | null): string {
  if (!card) return '';

  const isReactTrack = isReactTrackId(card.track);

  let commentedSnippet: string;
  let liveSnippet = '';
  if (card.testHarness?.trim()) {
    // The card's own example checks are real code from the start: running the buffer shows each check as PASS/FAIL.
    // (runHarness recognises a buffer that already contains them and does not append them a second time.)
    liveSnippet = card.testHarness.trim();

    if (isReactTrack) {
      commentedSnippet = `// // Inline Component / Hook Test Harness (template, uncomment and adapt):
// function Harness() {
//   // Call your hook or component here
//   const [status, setStatus] = React.useState('Mounted');
//   return React.createElement('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
//     React.createElement('div', { style: { fontWeight: 600, color: '#06b6d4' } }, '⚛️ React Live Hook Test'),
//     React.createElement('div', null, 'Status: ' + status),
//     React.createElement('button', {
//       className: 'btn btn-secondary',
//       style: { width: 'fit-content', padding: '4px 10px', fontSize: '11px' },
//       onClick: () => setStatus('State updated @ ' + new Date().toLocaleTimeString())
//     }, 'Trigger State Update')
//   );
// }
// mount(Harness);`;
    } else {
      commentedSnippet = '';
    }
  } else if (isReactTrack) {
    commentedSnippet = `// // Inline Component / Hook Test Harness:
// function Harness() {
//   const [state, setState] = React.useState('Ready');
//   return React.createElement('div', { style: { padding: '10px' } }, '⚛️ React Live Test: ' + state);
// }
// mount(Harness);`;
  } else {
    const titleLower = card.title.toLowerCase();
    const idLower = card.id.toLowerCase();
    if (
      card.track === 'async-js' ||
      titleLower.includes('fetch') ||
      idLower.includes('fetch')
    ) {
      commentedSnippet = `// fetchData('https://jsonplaceholder.typicode.com/todos/1').then(console.log).catch(console.error);`;
    } else if (
      card.track === 'algorithms' ||
      titleLower.includes('two sum') ||
      idLower.includes('two-sum') ||
      titleLower.includes('sorted')
    ) {
      commentedSnippet = `// console.log(twoSumSorted([2, 7, 11, 15], 9));`;
    } else {
      commentedSnippet = `// console.log("Run test snippet here");`;
    }
  }

  const body = [liveSnippet, commentedSnippet].filter((part) => part.length > 0).join('\n\n');
  // A large, obviously empty gap for the answer, then the checks.
  const gap = '\n'.repeat(IMPLEMENTATION_GAP_LINES + 1);
  return `// Write your implementation below${gap}// Test runner example:\n${body}`;
}
