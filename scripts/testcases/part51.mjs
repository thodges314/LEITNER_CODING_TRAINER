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
  'd3-css-coordinate-layout': [
    r(
      'Initial render mounts container with specified width/height and renders coordinate points',
      'renderCoordinateLayout(container, { data: SAMPLE_POINTS, width: 400, height: 300 })',
      'Container rendered with 3 .coordinate-point children for p1, p2, p3',
      { callSignature: 'renderCoordinateLayout(container, { data: POINTS, width: 400, height: 300 })' }
    ),
    r(
      'D3 linear scales calculate correct left and top coordinates with inverted Y-axis',
      'read left and top style offsets',
      'p1 at (12px, 272px), p2 at (356px, -4px)',
      { callSignature: 'getComputedPosition(point)' }
    ),
    r(
      'D3 size scale sizes elements proportionally to data values',
      'read width and height styles',
      'p1 has diameter 16px, p2 has diameter 48px, p3 has diameter 32px',
      { callSignature: 'getDiameter(point)' }
    ),
    r(
      'Clicking a point calls onSelectPoint and updates data-selected to true',
      'click [data-point-id="p2"]',
      'p2 receives data-selected="true", p1 receives "false", onSelectPoint fired with p2',
      { callSignature: 'fire.click(p2)' }
    ),
    r(
      'Empty or single-point data gracefully falls back to default domain and sizes',
      'renderCoordinateLayout(container, { data: [{ id: "solo", x: 50, y: 50, value: 100 }] })',
      'Point renders with valid non-NaN coordinates and default diameter 32px',
      { callSignature: 'renderCoordinateLayout(container, { data: [singlePoint] })' }
    ),
  ],
  'd3-graph-theory-visualizer': [
    r(
      'Renders SVG canvas with correct dimensions and role',
      'renderForceGraph(container, { nodes, links, width: 400, height: 300 })',
      '<svg width="400" height="300" role="img" aria-label="Force graph">',
      { callSignature: 'renderForceGraph(container, { nodes, links, width: 400, height: 300 })' }
    ),
    r(
      'Renders lines for links with source and target data attributes',
      'inspect .graph-link elements',
      'lines render with data-source="A", data-target="B", stroke="steelblue", stroke-width="2"',
      { callSignature: 'container.querySelectorAll(".graph-link")' }
    ),
    r(
      'Renders circles for nodes with data-node-id and label text',
      'inspect .graph-node elements and labels',
      'circles render with data-node-id matching node IDs, r=14, stroke="steelblue"',
      { callSignature: 'container.querySelectorAll(".graph-node")' }
    ),
    r(
      'Clicking a node highlights it with data-selected=true and fires onSelectNode',
      'click [data-node-id="B"]',
      'data-selected="true", fill="orange", onSelectNode called with node B',
      { callSignature: 'nodeB.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Handles empty nodes and links gracefully and cleans up on destroy',
      'renderForceGraph(container, { nodes: [], links: [] })',
      'Renders empty graph and cleans up simulation without throwing exceptions',
      { callSignature: 'renderForceGraph(container, { nodes: [], links: [] })' }
    ),
  ],
  'tailwind-pricing-card': [
    r(
      'Basic non-popular tier renders semantic article with slate border and features list',
      "renderPricingCard({ name: 'Starter', price: 15, features: ['1 Project', 'Community Support'] })",
      '<article class="... border-slate-700 ..."> with h3, $15/mo, and button',
      { callSignature: 'renderPricingCard(tier)' }
    ),
    r(
      'Popular tier renders popular badge and indigo ring styling',
      "renderPricingCard({ name: 'Pro', price: 49, popular: true, features: ['Unlimited Projects'] })",
      'article has border-indigo-500 ring-2, badge with "Most Popular", button has bg-indigo-600',
      { callSignature: 'renderPricingCard(popularTier)' }
    ),
    r(
      'Applies custom period and custom CTA text correctly',
      "renderPricingCard({ name: 'Enterprise', price: 999, period: '/year', ctaText: 'Contact Sales', features: [] })",
      'Displays $999/year and button displays "Contact Sales"',
      { callSignature: 'renderPricingCard(enterpriseTier)' }
    ),
    r(
      'Renders empty features list gracefully without extra items',
      "renderPricingCard({ name: 'Free', price: 0, features: [] })",
      '<ul> contains 0 <li> elements',
      { callSignature: 'renderPricingCard(freeTier)' }
    ),
  ],
  'tailwind-dismissible-banner': [
    r(
      "Default info variant renders with role='alert' and sky color classes",
      '<DismissibleBanner title="Info Note" message="System is operational." />',
      'renders role="alert" with bg-sky-50 and border-sky-200 and Dismiss button',
      { callSignature: '<DismissibleBanner title="Info" message="..." />' }
    ),
    r(
      'Success variant applies emerald color classes',
      '<DismissibleBanner variant="success" title="Saved" message="All changes saved." />',
      'renders role="alert" with bg-emerald-50 and border-emerald-200',
      { callSignature: '<DismissibleBanner variant="success" ... />' }
    ),
    r(
      'Warning and error variants apply matching amber and rose classes',
      '<DismissibleBanner variant="warning" ... /> and <DismissibleBanner variant="error" ... />',
      'renders matching bg-amber-50 and bg-rose-50 classes',
      { callSignature: '<DismissibleBanner variant="warning|error" ... />' }
    ),
    r(
      'Clicking dismiss button hides banner and invokes onDismiss',
      'fire.click(dismissBtn)',
      'Banner is dismissed (null rendered) and onDismiss callback is invoked',
      { callSignature: 'fire.click(btn)' }
    ),
  ],
  'tailwind-metric-card': [
    r(
      'Card container has dark background, border, padding, and max-width classes',
      'container.firstElementChild',
      'classList contains max-w-sm, rounded-2xl, p-6, bg-slate-900, border-slate-800',
      { callSignature: 'html' }
    ),
    r(
      'Header contains metric title and trend badge with emerald colors',
      'container.querySelector("span.text-slate-400"), container.querySelector("span.text-emerald-400")',
      'displays "Total Revenue" and "+12.5%" rounded-full badge',
      { callSignature: 'html' }
    ),
    r(
      'Displays formatted stat value and comparison subtext',
      'container.querySelector(".text-3xl"), container.querySelector("p.text-slate-500")',
      'displays "$48,250" and "vs. $42,890 last month"',
      { callSignature: 'html' }
    ),
    r(
      'Action button is styled with indigo background, rounded corners, and focus ring',
      'container.querySelector("button")',
      'button has type="button", "View Detailed Report", bg-indigo-600, w-full, rounded-xl',
      { callSignature: 'html' }
    ),
  ],
};

