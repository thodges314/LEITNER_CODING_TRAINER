import type { TopicItem } from '../../lib/leitner';

/**
 * Constructs the default starter code template and commented test harness snippet
 * tailored to the card and its track.
 */
export function getStarterSnippet(card: TopicItem | null): string {
  if (!card) return '';

  const isReactTrack = card.track === 'react' || card.track === 'react-patterns';

  let commentedSnippet: string;
  if (card.testHarness?.trim()) {
    const lines = card.testHarness.trim().split('\n');
    const commentedLines = lines
      .map((l) => (l.trim().length > 0 ? `// ${l}` : '//'))
      .join('\n');

    if (isReactTrack) {
      commentedSnippet = `${commentedLines}
//
// // Inline Component / Hook Test Harness:
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
      commentedSnippet = commentedLines;
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
      card.track === 'async-web-plumbing' ||
      titleLower.includes('fetch') ||
      idLower.includes('fetch')
    ) {
      commentedSnippet = `// fetchData('https://jsonplaceholder.typicode.com/todos/1').then(console.log).catch(console.error);`;
    } else if (
      card.track === 'algorithms' ||
      card.track === 'algorithmic-screens' ||
      titleLower.includes('two sum') ||
      idLower.includes('two-sum') ||
      titleLower.includes('sorted')
    ) {
      commentedSnippet = `// console.log(twoSumSorted([2, 7, 11, 15], 9));`;
    } else {
      commentedSnippet = `// console.log("Run test snippet here");`;
    }
  }

  return `// Write your implementation below\n\n\n// Test runner example:\n${commentedSnippet}`;
}
