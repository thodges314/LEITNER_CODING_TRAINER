import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

// react-components track.
export default {
  'star-rating-component': [
    r('Renders a labelled radiogroup with max stars (default 5)', '<StarRating value={2} />', "<div role='radiogroup' aria-label='Rating'><button role='radio' aria-label='1 star' aria-checked='false' tabindex='-1' data-filled='true'>★</button><button role='radio' aria-label='2 stars' aria-checked='true' tabindex='0' data-filled='true'>★</button><button role='radio' aria-label='3 stars' aria-checked='false' tabindex='-1' data-filled='false'>★</button><button role='radio' aria-label='4 stars' aria-checked='false' tabindex='-1' data-filled='false'>★</button><button role='radio' aria-label='5 stars' aria-checked='false' tabindex='-1' data-filled='false'>★</button></div>"),
    r('The max prop changes the number of stars', '<StarRating value={2} max={8} />', 'renders 8 star buttons with role="radio"'),
    r('The selected star is aria-checked and stars up to the value are filled', '<StarRating value={3} />', 'star 3 has aria-checked="true"; stars 1..3 carry data-filled="true" (stars 4..5 "false")'),
    r('Clicking a star calls onChange with its number', 'value=2; click star 4', 'calls onChange(4)'),
    r('Clicking the current rating clears it (onChange(0))', 'value=2; click star 2', 'calls onChange(0) (clears selection)'),
    r('Hovering previews a rating and leaving the group restores it', 'value=1; hover star 4, then mouse out of radiogroup', 'data-filled="true" on 4 stars during hover; restores to 1 star after mouseout'),
    r('Arrow keys change the rating within 1..max', 'value=5: ArrowRight, ArrowLeft; value=1: ArrowLeft, ArrowUp', 'calls onChange with clamped values: 5, 4, 1, 2'),
    r('Only one star is in the tab order (roving tabindex)', 'value=3, then value=0', 'tabIndex 0 on 3rd star (others -1); when value=0, tabIndex 0 on 1st star'),
  ],
  'countdown-component': [
    r('Shows the starting seconds and does not run until Start', '<Countdown seconds={3} tickMs={60} />, wait 180 ms', "timer still shows '3'"),
    r('Start counts down to 0 and calls onDone exactly once', "seconds=2; click 'Start'", "timer reaches '0' and stays; onDone called once"),
    r('Pause stops the countdown and Start resumes it', "seconds=20; Start, then 'Pause'; later 'Start'", 'value frozen while paused; decreases again after Start'),
    r('Reset restores the starting value and stops', "seconds=5; Start; then 'Reset'", "timer shows '5' and stays"),
    r('Unmounting stops the timer (no onDone afterwards)', 'seconds=1; Start; unmount immediately', 'onDone is never called'),
  ],
  'file-explorer-tree': [
    r('Renders the top level collapsed', "nodes: src/{components/{Button.jsx}, index.js}, README.md", "buttons: 'src', 'README.md' inside role='tree'", {
      callSignature: "<FileTree nodes={[{ name: 'src', children: [{ name: 'components', children: [{ name: 'Button.jsx' }] }, { name: 'index.js' }] }, { name: 'README.md' }]} onSelect={handleSelect} />",
    }),
    r('Clicking a folder expands it and sets aria-expanded', "click 'src'", "buttons: src, components, index.js, README.md; aria-expanded='true'", {
      callSignature: "click folder 'src'",
    }),
    r('Clicking it again collapses it', "click 'src' again", "buttons: src, README.md; aria-expanded='false'", {
      callSignature: "click folder 'src' again",
    }),
    r('Nested folders keep their own state', "expand 'src' and 'components', then collapse 'components'", "Button.jsx appears, then disappears; 'src' stays open", {
      callSignature: "expand 'src' and 'components', then collapse 'components'",
    }),
    r('Clicking a file calls onSelect with its full path', "click Button.jsx (inside src/components) and README.md", "onSelect('src/components/Button.jsx'), onSelect('README.md')", {
      callSignature: "click file 'Button.jsx'",
    }),
    r('Files are not expandable (no aria-expanded) and clicking a folder does not call onSelect', "inspect the README.md treeitem", 'no aria-expanded attribute', {
      callSignature: "inspect file 'README.md'",
    }),
  ],
};
