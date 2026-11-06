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
      'rects render with data-label, data-value, data-index, fill="teal", and proportional heights',
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
      'path has stroke="orange", stroke-width="3", fill="none", and valid M-curve d attribute',
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
      'circles render with data-x, data-y, data-index, fill="purple", and inverted Y scaling',
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
  'd3-stratify-nested-hierarchy': [
    r(
      'Builds validated hierarchy tree and aggregates total root value',
      'stratifyHierarchy(SAMPLE_TREE_DATA)',
      'rootId="flare", totalValue=11838, maxDepth=2',
      { callSignature: 'stratifyHierarchy(SAMPLE_TREE_DATA)' }
    ),
    r(
      'Extracts leaves with correct parentId, depth, height, and values',
      'stratifyHierarchy(SAMPLE_TREE_DATA).leaves',
      'Leaves array contains 3 leaves with valid parentId, depth, height=0, and values',
      { callSignature: 'result.leaves' }
    ),
    r(
      'Traverses ancestors from leaf node up to root',
      'result.ancestorsOf("cluster")',
      'Returns ["cluster", "analytics", "flare"] and [] for unknown node',
      { callSignature: 'result.ancestorsOf("cluster")' }
    ),
    r(
      'Collects subtree descendants from branch node',
      'result.descendantsOf("analytics")',
      'Returns ["analytics", "cluster", "graph"] and valid node metric with value 10838',
      { callSignature: 'result.descendantsOf("analytics")' }
    ),
    r(
      'Applies custom valueAccessor option',
      'stratifyHierarchy(customData, { valueAccessor: d => d.headcount * 10 })',
      'totalValue=650 and leaves have custom scaled values',
      { callSignature: 'stratifyHierarchy(data, { valueAccessor })' }
    ),
    r(
      'Validates inputs and handles single root edge case',
      'stratifyHierarchy([]) and single node',
      'Throws on empty input; single node returns maxDepth=0 and totalValue=99',
      { callSignature: 'stratifyHierarchy([])' }
    ),
  ],
  'd3-quadtree-spatial-index': [
    r(
      'Initializes 2D quadtree and returns size and extent',
      'createQuadtreeIndex(SAMPLE_POINTS)',
      'size=3 and extent covers bounding coordinates [10..90, 20..80]',
      { callSignature: 'createQuadtreeIndex(SAMPLE_POINTS)' }
    ),
    r(
      'Finds single nearest point without distance constraint',
      'index.findNearest(12, 22) and index.findNearest(88, 42)',
      'Returns nearest point A for (12, 22) and C for (88, 42)',
      { callSignature: 'index.findNearest(12, 22)' }
    ),
    r(
      'Respects maximum search radius constraint in findNearest',
      'index.findNearest(12, 22, 5) vs index.findNearest(12, 22, 1)',
      'Radius 5 finds A; radius 1 returns null as distance exceeds threshold',
      { callSignature: 'index.findNearest(12, 22, radius)' }
    ),
    r(
      'Collects multiple points within radius using pruned quad visit',
      'index.findPointsInRadius(30, 50, 45)',
      'Returns matching points ["A", "B"] using pruned quadrant traversal',
      { callSignature: 'index.findPointsInRadius(30, 50, 45)' }
    ),
    r(
      'Supports incremental point insertion with add and addAll chaining',
      'index.add(p1).addAll([p2, p3])',
      'Inserts points with method chaining and updates index size from 0 to 3',
      { callSignature: 'index.add(p).addAll(pts)' }
    ),
    r(
      'Handles overlapping coincident points and empty index gracefully',
      'emptyIndex and duplicate coordinate points',
      'Empty index returns null/[]; coincident points in duplicate index both returned',
      { callSignature: 'createQuadtreeIndex().findNearest(10, 10)' }
    ),
  ],
  'd3-delaunay-voronoi-snapping': [
    r(
      'Appends SVG canvas with dimensions, role, aria-label, and layer groups',
      'renderVoronoiSnapping(container, SAMPLE_POINTS, { width: 480, height: 320 })',
      'SVG rendered with width="480", height="320", role="img", aria-label="Voronoi diagram", and layer groups',
      { callSignature: 'renderVoronoiSnapping(container, points, { width: 480, height: 320 })' }
    ),
    r(
      'Generates clipped Voronoi cell paths and point markers for each datum',
      'inspect circle.voronoi-point and path.voronoi-cell elements',
      '4 circles and 4 closed M...Z polygon paths rendered with transparent fill and stroke',
      { callSignature: 'container.querySelectorAll("path.voronoi-cell")' }
    ),
    r(
      'Finds closest point index across 2D plane via Delaunay triangulation',
      'instance.findClosestIndex(45, 55) and instance.findClosestIndex(205, 75)',
      'Returns index 0 near (50, 60) and index 1 near (200, 80)',
      { callSignature: 'instance.findClosestIndex(45, 55)' }
    ),
    r(
      'Clicking a Voronoi cell activates point and invokes onSelectPoint callback',
      'click path.voronoi-cell[data-index="2"]',
      'onSelectPoint called with Gamma point and index 2, point 2 marked data-active="true"',
      { callSignature: 'cell.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Handles empty points and showCells option gracefully and cleans up on destroy',
      'renderVoronoiSnapping(container, [], { showCells: false }) and instance.destroy()',
      'showCells: false sets stroke="none", empty points returns -1 for findClosestIndex, destroy clears DOM',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-treemap-squarified-tiling': [
    r(
      'Appends SVG container with dimensions, role, and aria-label',
      'renderTreemap(container, SAMPLE_TREE, { width: 520, height: 340 })',
      'SVG rendered with width="520", height="340", role="img", aria-label="Treemap chart"',
      { callSignature: 'renderTreemap(container, data, { width: 520, height: 340 })' }
    ),
    r(
      'Computes squarified treemap layout sorted descending by value',
      'instance.getLeaves()',
      'Returns 4 leaf cells summing to total canvas area, with larger values allocated proportionally larger area',
      { callSignature: 'instance.getLeaves()' }
    ),
    r(
      'Renders treemap cell groups, proportional rects, and text labels',
      'inspect g.treemap-cell, rect.treemap-rect, and text.treemap-label',
      '4 translated cell groups rendered with colored rects and leaf name labels',
      { callSignature: 'container.querySelectorAll("g.treemap-cell")' }
    ),
    r(
      'Respects paddingInner, paddingOuter, and round configuration options',
      'renderTreemap(container, SAMPLE_TREE, { paddingOuter: 10, paddingInner: 4, round: true })',
      'Leaf coordinates inset by outer padding >= 10 and rounded to integer pixel bounds',
      { callSignature: 'renderTreemap(container, data, { paddingOuter: 10, round: true })' }
    ),
    r(
      'Clicking a treemap cell invokes onSelectCell with cell metric and index',
      'click g.treemap-cell[data-index="1"]',
      'onSelectCell called with leaf cell metric and index 1',
      { callSignature: 'cell.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Handles empty or zero-value hierarchy gracefully and cleans up on destroy',
      'instance.destroy() and renderTreemap(container, zeroTree)',
      'Container cleared on destroy and zero-value tree renders 0 cells safely',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-force-simulation-headless': [
    r(
      'Converges synchronously without mutating input nodes or links',
      'runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, { alphaMin: 0.05 })',
      'Stops background timer, steps ticks until alpha < 0.05, and returns converged: true without mutating inputs',
      { callSignature: 'runHeadlessForceSimulation(nodes, links, { alphaMin: 0.05 })' }
    ),
    r(
      'Centers network centroid near canvas midpoint and resolves link geometry',
      'runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, { width: 500, height: 360 })',
      'Centroids settle near (250, 180) and links expose sourceId, targetId, and Euclidean length',
      { callSignature: 'runHeadlessForceSimulation(nodes, links, { width: 500, height: 360 })' }
    ),
    r(
      'Separates overlapping coincident nodes using collision and charge forces',
      'runHeadlessForceSimulation([{ id: "N1", x: 200, y: 150, radius: 18 }, { id: "N2", x: 200, y: 150, radius: 18 }])',
      'Coincident nodes separate to distance >= 2 * radius via forceCollide',
      { callSignature: 'runHeadlessForceSimulation(overlappingNodes, [], { collisionRadius: 18 })' }
    ),
    r(
      'Respects maxTicks budget and reports converged: false when stopped early',
      'runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, { alphaMin: 0.001, maxTicks: 5 })',
      'Executes exactly 5 ticks, returns converged: false, and computes positive kineticEnergy',
      { callSignature: 'runHeadlessForceSimulation(nodes, links, { maxTicks: 5 })' }
    ),
    r(
      'Looks up settled nodes by ID via getNode and returns null for unknown IDs',
      'report.getNode("B") and report.getNode("UNKNOWN")',
      'Returns settled node object for "B" and null for unknown node ID',
      { callSignature: 'report.getNode("B")' }
    ),
    r(
      'Handles empty node list gracefully without running ticks',
      'runHeadlessForceSimulation([], [])',
      'Returns 0 ticks, converged: true, kineticEnergy: 0, and empty nodes/links arrays',
      { callSignature: 'runHeadlessForceSimulation([], [])' }
    ),
  ],
  'd3-brush-zoom-coordinator': [
    r(
      'Mounts SVG with focus and context chart groups and brush layer',
      'renderBrushCoordinator(container, SAMPLE_SERIES, { width: 500, focusHeight: 180, contextHeight: 60 })',
      'SVG rendered with focus-chart, context-chart, brush-layer, and 6 focus dots',
      { callSignature: 'renderBrushCoordinator(container, series, options)' }
    ),
    r(
      'Renders focus and context line paths with full initial domain',
      'renderBrushCoordinator(container, SAMPLE_SERIES, { color: "teal" })',
      'focus-line and context-line render M-paths across full domain [0, 50]',
      { callSignature: 'instance.getDomain()' }
    ),
    r(
      'Applies initialSelection on mount and filters focus dots to active window',
      'renderBrushCoordinator(container, SAMPLE_SERIES, { initialSelection: [10, 30] })',
      'Focus domain set to [10, 30] and focus-dot elements filtered to x in [10, 20, 30]',
      { callSignature: 'renderBrushCoordinator(container, series, { initialSelection: [10, 30] })' }
    ),
    r(
      'Updating domain via setBrushDomain rescales focus view and fires onBrushChange',
      'instance.setBrushDomain([20, 40])',
      'Rescales focusX to [20, 40], updates focus dots, and invokes onBrushChange callback',
      { callSignature: 'instance.setBrushDomain([20, 40])' }
    ),
    r(
      'Clearing brush selection with null restores full domain and all data points',
      'instance.setBrushDomain(null)',
      'Restores active domain to [0, 50] and renders all 6 focus points',
      { callSignature: 'instance.setBrushDomain(null)' }
    ),
    r(
      'Handles empty data gracefully and cleans up DOM on destroy',
      'renderBrushCoordinator(container, []) and instance.destroy()',
      'Renders empty coordinator safely and clears container innerHTML on destroy',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-geo-projection-path': [
    r(
      'Mounts SVG container with role, aria-label, and feature/centroid groups',
      'renderGeoMap(container, SAMPLE_GEOJSON, { width: 500, height: 320 })',
      'SVG rendered with width="500", height="320", role="img", aria-label="Geographic map", and map groups',
      { callSignature: 'renderGeoMap(container, geojson, { width: 500, height: 320 })' }
    ),
    r(
      'Projects GeoJSON features into closed SVG paths and computes centroids',
      'instance.getCentroids()',
      'Renders 2 closed M...Z polygon paths and computes WEST/EAST centroids and positive areas',
      { callSignature: 'instance.getCentroids()' }
    ),
    r(
      'Supports projectionType switching and projectCoordinate lookup',
      'renderGeoMap(..., { projectionType: "mercator" }) vs { projectionType: "equirectangular" }',
      'Projects [-115, 40] using the selected projection and returns distinct planar coordinates',
      { callSignature: 'instance.projectCoordinate([-115, 40])' }
    ),
    r(
      'Clicking a feature highlights it and triggers onSelectFeature with metric',
      'click path.geo-feature[data-index="1"]',
      'Marks clicked path data-active="true" with activeColor and invokes onSelectFeature callback',
      { callSignature: 'path.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Respects showCentroids: false by omitting centroid markers',
      'renderGeoMap(container, SAMPLE_GEOJSON, { showCentroids: false })',
      'Renders feature paths while omitting circle.geo-centroid elements',
      { callSignature: 'renderGeoMap(container, geojson, { showCentroids: false })' }
    ),
    r(
      'Handles empty FeatureCollection gracefully and cleans up on destroy',
      'renderGeoMap(container, { type: "FeatureCollection", features: [] }) and instance.destroy()',
      'Returns empty centroids array and clears container innerHTML on destroy',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-contour-density-grid': [
    r(
      'Mounts SVG container with dimensions, role, aria-label, and layer groups',
      'renderContourDensity(container, SAMPLE_CLUSTER, { width: 440, height: 280 })',
      'SVG rendered with width="440", height="280", role="img", aria-label="Contour density chart", and layer groups',
      { callSignature: 'renderContourDensity(container, points, { width: 440, height: 280 })' }
    ),
    r(
      'Generates MultiPolygon density contours and renders SVG band paths',
      'instance.getBands() and instance.getPeakDensity()',
      'Computes isoline MultiPolygons, renders M...Z contour-band paths, and reports positive peak density',
      { callSignature: 'instance.getBands()' }
    ),
    r(
      'Respects point weights when computing peak kernel density',
      'renderContourDensity(container, weightedPoints, { bandwidth: 20, thresholds: 5 })',
      'Points with weight 10 produce higher peak density than unweighted points',
      { callSignature: 'instance.getPeakDensity()' }
    ),
    r(
      'Clicking a contour band invokes onSelectBand with band summary and index',
      'click path.contour-band[data-index="0"]',
      'onSelectBand invoked with ContourBandSummary { index: 0, value, ringCount } and index 0',
      { callSignature: 'bandPath.dispatchEvent(new MouseEvent("click"))' }
    ),
    r(
      'Respects showPoints: false by hiding raw density point circles',
      'renderContourDensity(container, SAMPLE_CLUSTER, { showPoints: false })',
      'Renders contour bands while omitting circle.density-point elements',
      { callSignature: 'renderContourDensity(container, points, { showPoints: false })' }
    ),
    r(
      'Handles empty points array gracefully and cleans up DOM on destroy',
      'renderContourDensity(container, []) and instance.destroy()',
      'Returns empty bands, 0 peak density, and clears container innerHTML on destroy',
      { callSignature: 'instance.destroy()' }
    ),
  ],
  'd3-data-join-enter-update-exit': [
    r(
      'Mounts SVG container and enters all initial rows with data-join="enter"',
      'renderKeyedDataJoin(container, INITIAL_METRICS, { width: 440, rowHeight: 36 })',
      'Renders 3 g.join-row elements with data-join="enter" and stats { entered: 3, updated: 0, exited: 0, total: 3 }',
      { callSignature: 'renderKeyedDataJoin(container, items, options)' }
    ),
    r(
      'Preserves existing DOM node identity across keyed updates and marks data-join="update"',
      'instance.update([{ id: "mem", ... }, { id: "cpu", ... }, { id: "disk", ... }])',
      'Surviving keys reuse the exact same DOM elements with data-join="update", new key enters, removed key exits',
      { callSignature: 'instance.update(nextItems)' }
    ),
    r(
      'Reorders DOM elements to match new data array order and updates transforms',
      'instance.update([{ id: "net", value: 90 }, { id: "cpu", value: 25 }])',
      'DOM node order matches nextItems and translate(0, i * rowHeight) updates accordingly',
      { callSignature: 'instance.update(reorderedItems)' }
    ),
    r(
      'Scales bar widths proportionally and clamps values exceeding maxValue',
      'renderKeyedDataJoin(container, [{ value: 25 }, { value: 50 }, { value: 200 }], { width: 340, maxValue: 100 })',
      'Maps [0, 100] to [0, 200]px and clamps 200 at 200px',
      { callSignature: 'renderKeyedDataJoin(container, items, { width: 340, maxValue: 100 })' }
    ),
    r(
      'Handles empty array transitions and cleans up DOM on destroy',
      'instance.update([]) and instance.destroy()',
      'Exits all remaining rows and clears container innerHTML on destroy',
      { callSignature: 'instance.update([])' }
    ),
  ],
  'd3-scales-domain-range-basics': [
    r(
      'Mounts SVG container, baseline, and scaled rect.scale-bar elements',
      'renderScaledCoordinateChart(container, SAMPLE_METRICS, { width: 440, height: 240, padding: 30 })',
      'SVG rendered with line.zero-baseline at y=210, 4 rect.scale-bar elements, and extent [25, 100]',
      { callSignature: 'renderScaledCoordinateChart(container, data, options)' }
    ),
    r(
      'Maps data values to inverted SVG Y coordinates and proportional heights',
      'instance.getBarGeometry("Q1", 0), getBarGeometry("Q2", 50), getBarGeometry("Q3", 100)',
      'Maps 0 to baseline y=200 (height 0), 50 to y=110 (height 90), and 100 to top y=20 (height 180)',
      { callSignature: 'instance.getBarGeometry(category, value)' }
    ),
    r(
      'Computes categorical band X positions, bandwidth, and centerX',
      'instance.getBarGeometry("Q1", 25) and instance.getBarGeometry("Q4", 75)',
      'Computes discrete band x, bandwidth, and centerX = x + bandwidth / 2',
      { callSignature: 'instance.getBarGeometry(category, value)' }
    ),
    r(
      'Supports continuous Y coordinate inversion via invertY and clamping',
      'instance.invertY(20), instance.invertY(110), instance.invertY(200)',
      'Inverts pixel Y coordinates back to domain values (100, 50, 0) and respects clamp option',
      { callSignature: 'instance.invertY(pixelY)' }
    ),
    r(
      'Handles empty dataset gracefully and cleans up DOM on destroy',
      'renderScaledCoordinateChart(container, []) and instance.destroy()',
      'Returns extent [0, 0], 0 bars, and clears container innerHTML on destroy',
      { callSignature: 'instance.destroy()' }
    ),
  ],
};


