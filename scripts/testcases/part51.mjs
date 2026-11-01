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
  'd3-svg-bar-chart': [
    r(
      'Appends SVG container with correct dimensions, role, and aria-label',
      'renderBarChart(container, SAMPLE_DATA, { width: 500, height: 300 })',
      'SVG rendered with width="500", height="300", role="img", aria-label="Bar chart"',
      { callSignature: 'renderBarChart(container, data, { width: 500, height: 300 })' }
    ),
    r(
      'Renders chart-area group and both x and y axis groups with translation',
      'renderBarChart(container, SAMPLE_DATA, { width: 400, height: 260, margin })',
      'chart-area translated by (margin.left, margin.top), x-axis translated by (0, innerHeight)',
      { callSignature: 'renderBarChart(container, data, options)' }
    ),
    r(
      'Renders bar elements with data attributes, proportional heights, and color',
      'inspect rect.bar elements',
      'rects render with data-label, data-value, data-index, fill="#10b981", and proportional heights',
      { callSignature: 'container.querySelectorAll("rect.bar")' }
    ),
    r(
      'Clicking a bar triggers onSelectBar callback with datum and index',
      'click rect.bar[data-index="1"]',
      'onSelectBar callback invoked with datum { label: "Beta", value: 80 } and index 1',
      { callSignature: 'bar.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Calling destroy removes SVG and cleans up container',
      'instance.destroy()',
      'Container innerHTML cleared and SVG removed',
      { callSignature: 'instance.destroy()' }
    ),
    r(
      'Handles empty data gracefully without throwing',
      'renderBarChart(container, [])',
      'Renders empty axes without throwing errors and returns clean instance',
      { callSignature: 'renderBarChart(container, [])' }
    ),
  ],
  'd3-svg-line-chart': [
    r(
      'Mounts SVG container with ARIA attributes and chart-area grouping',
      'renderLineChart(container, SAMPLE_POINTS, { width: 450, height: 280 })',
      'SVG rendered with width="450", height="280", role="img", aria-label="Line chart"',
      { callSignature: 'renderLineChart(container, points, { width: 450, height: 280 })' }
    ),
    r(
      'Generates smooth curve path with stroke styling and M-command path string',
      'inspect path.chart-line',
      'path has stroke="#f59e0b", stroke-width="3", fill="none", and valid M-curve d attribute',
      { callSignature: 'container.querySelector("path.chart-line")' }
    ),
    r(
      'Renders data point markers with coordinates and data attributes',
      'inspect circle.chart-point elements',
      'circles render with data-x, data-y, data-index, and inverted Y coordinate scaling',
      { callSignature: 'container.querySelectorAll("circle.chart-point")' }
    ),
    r(
      'Respects showPoints: false by omitting point markers',
      'renderLineChart(container, SAMPLE_POINTS, { showPoints: false })',
      'Path is rendered but circle.chart-point elements are not generated',
      { callSignature: 'renderLineChart(container, points, { showPoints: false })' }
    ),
    r(
      'Clicking a point circle fires onSelectPoint with point and index',
      'click circle.chart-point[data-index="2"]',
      'onSelectPoint called with { x: 30, y: 25 } and index 2',
      { callSignature: 'point.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Calling destroy cleans up container and handles empty data gracefully',
      'instance.destroy() and renderLineChart(container, [])',
      'Container innerHTML cleared on destroy and empty points handled safely',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-svg-donut-chart': [
    r(
      'Appends SVG container with correct dimensions, role, and aria-label',
      'renderDonutChart(container, SAMPLE_DATA, { width: 480, height: 320 })',
      'SVG rendered with width="480", height="320", role="img", aria-label="Donut chart"',
      { callSignature: 'renderDonutChart(container, data, { width: 480, height: 320 })' }
    ),
    r(
      'Renders centered donut group translated to (width / 2, height / 2) and center label',
      'renderDonutChart(container, SAMPLE_DATA, { width: 400, height: 300, centerLabel: "Languages" })',
      'chart-donut translated to (200, 150) with center text "Languages"',
      { callSignature: 'renderDonutChart(container, data, options)' }
    ),
    r(
      'Renders arc slice paths with data attributes and fill colors',
      'inspect path.arc-slice elements',
      'slices render with data-label, data-value, data-index, valid d path, and fill colors',
      { callSignature: 'container.querySelectorAll("path.arc-slice")' }
    ),
    r(
      'Respects custom innerRadius (e.g. 0 for full pie) and outerRadius',
      'renderDonutChart(container, SAMPLE_DATA, { innerRadius: 0, outerRadius: 100 })',
      'Generates solid pie slice paths passing through center origin',
      { callSignature: 'renderDonutChart(container, data, { innerRadius: 0 })' }
    ),
    r(
      'Clicking a slice triggers onSelectSlice callback with datum and index',
      'click path.arc-slice[data-index="1"]',
      'onSelectSlice called with { label: "TypeScript", value: 35 } and index 1',
      { callSignature: 'slice.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Calling destroy removes SVG and handles empty data gracefully',
      'instance.destroy() and renderDonutChart(container, [], { centerLabel: "Empty" })',
      'Container innerHTML cleared on destroy and empty slices handled gracefully',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-svg-scatter-plot': [
    r(
      'Appends SVG canvas with dimensions, role, and aria-label',
      'renderScatterPlot(container, SAMPLE_POINTS, { width: 500, height: 350 })',
      'SVG rendered with width="500", height="350", role="img", aria-label="Scatter plot"',
      { callSignature: 'renderScatterPlot(container, points, { width: 500, height: 350 })' }
    ),
    r(
      'Renders chart-area group and both x and y axis groups with translation',
      'renderScatterPlot(container, SAMPLE_POINTS, { width: 450, height: 300, margin })',
      'chart-area translated by margin, x-axis translated to innerHeight, y-axis mounted',
      { callSignature: 'renderScatterPlot(container, points, options)' }
    ),
    r(
      'Renders scatter dot circles with coordinate attributes and fill color',
      'inspect circle.scatter-dot elements',
      'circles render with data-x, data-y, data-index, fill="#8b5cf6", and inverted Y scaling',
      { callSignature: 'container.querySelectorAll("circle.scatter-dot")' }
    ),
    r(
      'Respects custom point radius per datum or defaultRadius option',
      'inspect circle.scatter-dot[r] attributes',
      'P1 has radius 8 from datum, P2 has radius 6 from defaultRadius option',
      { callSignature: 'circle.getAttribute("r")' }
    ),
    r(
      'Clicking a dot invokes onSelectPoint callback with datum and index',
      'click circle.scatter-dot[data-index="2"]',
      'onSelectPoint called with { x: 40, y: 30, label: "P3" } and index 2',
      { callSignature: 'dot.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Handles empty dataset and cleans up container on destroy',
      'instance.destroy() and renderScatterPlot(container, [])',
      'Container cleared on destroy and empty dataset renders valid axes safely',
      { callSignature: 'instance.destroy()' }
    ),
  ],
};

