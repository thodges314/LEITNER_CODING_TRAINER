import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

export default {
  'd3-react-imperative-chart': [
    r(
      'Initial render mounts SVG and uses D3 to create data-joined rect elements',
      '<ChartDashboard data={SAMPLE_DATA} />',
      'SVG rendered with 3 rects showing data-label and data-value, status says "No selection"',
      { callSignature: '<ChartDashboard data={DATA} />' }
    ),
    r(
      'Clicking Highlight Max triggers parent control to call imperative handle on maximum bar',
      'click button[data-action="highlight-max"]',
      'Bar 1 receives data-highlighted="true", others "false", status displays "Selected: B (40)"',
      { callSignature: 'fire.click(highlightMaxBtn)' }
    ),
    r(
      'Clicking Reset clears the highlighted bar and restores status',
      'click button[data-action="reset"]',
      'All bars revert to data-highlighted="false", status displays "No selection"',
      { callSignature: 'fire.click(resetBtn)' }
    ),
    r(
      'Clicking Highlight First targets index 0',
      'click button[data-action="highlight-first"]',
      'Bar 0 receives data-highlighted="true", status displays "Selected: A (10)"',
      { callSignature: 'fire.click(highlightFirstBtn)' }
    ),
    r(
      'Direct imperative calls through ref update D3BarChart state and return active index',
      'ref.current.highlight(1), ref.current.resetHighlight(), ref.current.getHighlightedIndex()',
      'Exposed handle updates internal state and returns currently highlighted index',
      { callSignature: 'ref.current.highlight(1)' }
    ),
    r(
      'Direct click on SVG bar triggers onSelectBar and highlights the clicked bar',
      'click rect[data-index="2"]',
      'Bar 2 receives data-highlighted="true", status displays "Selected: C (25)"',
      { callSignature: 'fire.click(bar2)' }
    ),
  ],
};
