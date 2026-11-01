const { render, fire, q, qa, act } = $dom;

const SAMPLE_DATA = [
  { label: 'A', value: 10 },
  { label: 'B', value: 40 },
  { label: 'C', value: 25 },
];

// 1. Initial render mounts SVG and uses D3 to create data-joined rect elements
{
  const r = render(<ChartDashboard data={SAMPLE_DATA} />);
  const svg = q('svg', r.container);
  const bars = qa('rect', r.container);
  const statusEl = q('[data-testid="status"]', r.container);

  const passed =
    svg !== null &&
    svg.getAttribute('role') === 'img' &&
    bars.length === 3 &&
    bars[0].getAttribute('data-label') === 'A' &&
    bars[0].getAttribute('data-value') === '10' &&
    bars[1].getAttribute('data-label') === 'B' &&
    bars[1].getAttribute('data-value') === '40' &&
    statusEl !== null &&
    statusEl.textContent.trim() === 'No selection';

  $test.check(
    'Initial render mounts SVG and uses D3 to create data-joined rect elements',
    passed,
    { hasSvg: !!svg, barCount: bars.length, status: statusEl?.textContent }
  );
  r.unmount();
}

// 2. Clicking Highlight Max triggers parent control to call imperative handle on maximum bar
{
  const r = render(<ChartDashboard data={SAMPLE_DATA} />);
  const maxBtn = q('button[data-action="highlight-max"]', r.container);
  if (maxBtn) fire.click(maxBtn);

  const bars = qa('rect', r.container);
  const statusEl = q('[data-testid="status"]', r.container);

  const bar0Highlighted = bars[0]?.getAttribute('data-highlighted') === 'true';
  const bar1Highlighted = bars[1]?.getAttribute('data-highlighted') === 'true';
  const bar2Highlighted = bars[2]?.getAttribute('data-highlighted') === 'true';
  const statusMatches = statusEl?.textContent.includes('Selected: B (40)');

  $test.check(
    'Clicking Highlight Max triggers parent control to call imperative handle on maximum bar',
    !bar0Highlighted && bar1Highlighted && !bar2Highlighted && !!statusMatches,
    { bar0Highlighted, bar1Highlighted, bar2Highlighted, status: statusEl?.textContent }
  );
  r.unmount();
}

// 3. Clicking Reset clears the highlighted bar and restores status
{
  const r = render(<ChartDashboard data={SAMPLE_DATA} />);
  const maxBtn = q('button[data-action="highlight-max"]', r.container);
  const resetBtn = q('button[data-action="reset"]', r.container);

  if (maxBtn) fire.click(maxBtn);
  if (resetBtn) fire.click(resetBtn);

  const bars = qa('rect', r.container);
  const statusEl = q('[data-testid="status"]', r.container);

  const anyHighlighted = bars.some((b) => b.getAttribute('data-highlighted') === 'true');
  const statusCleared = statusEl?.textContent.trim() === 'No selection';

  $test.check(
    'Clicking Reset clears the highlighted bar and restores status',
    !anyHighlighted && statusCleared,
    { anyHighlighted, status: statusEl?.textContent }
  );
  r.unmount();
}

// 4. Clicking Highlight First targets index 0
{
  const r = render(<ChartDashboard data={SAMPLE_DATA} />);
  const firstBtn = q('button[data-action="highlight-first"]', r.container);
  if (firstBtn) fire.click(firstBtn);

  const bars = qa('rect', r.container);
  const statusEl = q('[data-testid="status"]', r.container);

  const bar0Highlighted = bars[0]?.getAttribute('data-highlighted') === 'true';
  const bar1Highlighted = bars[1]?.getAttribute('data-highlighted') === 'true';
  const statusMatches = statusEl?.textContent.includes('Selected: A (10)');

  $test.check(
    'Clicking Highlight First targets index 0',
    bar0Highlighted && !bar1Highlighted && !!statusMatches,
    { bar0Highlighted, status: statusEl?.textContent }
  );
  r.unmount();
}

// 5. Direct imperative calls through ref (highlight, resetHighlight, getHighlightedIndex)
{
  let exposedHandle = null;
  function TestWrapper() {
    const ref = useRef(null);
    useEffect(() => {
      exposedHandle = ref.current;
    });
    return <D3BarChart ref={ref} data={[{ label: 'X', value: 5 }, { label: 'Y', value: 15 }]} />;
  }

  const r = render(<TestWrapper />);
  let initialIdx = null;
  let midIdx = null;
  let endIdx = null;

  if (exposedHandle) {
    initialIdx = exposedHandle.getHighlightedIndex();
    act(() => {
      exposedHandle.highlight(1);
    });
    midIdx = exposedHandle.getHighlightedIndex();
    act(() => {
      exposedHandle.resetHighlight();
    });
    endIdx = exposedHandle.getHighlightedIndex();
  }

  const passed =
    exposedHandle !== null &&
    typeof exposedHandle.highlight === 'function' &&
    typeof exposedHandle.resetHighlight === 'function' &&
    typeof exposedHandle.getHighlightedIndex === 'function' &&
    initialIdx === null &&
    midIdx === 1 &&
    endIdx === null;

  $test.check(
    'Direct imperative calls through ref update D3BarChart state and return active index',
    passed,
    { initialIdx, midIdx, endIdx }
  );
  r.unmount();
}

// 6. Direct click on SVG bar triggers onSelectBar and highlights the clicked bar
{
  const r = render(<ChartDashboard data={SAMPLE_DATA} />);
  const bars = qa('rect', r.container);
  if (bars[2]) fire.click(bars[2]);

  const bar2Highlighted = bars[2]?.getAttribute('data-highlighted') === 'true';
  const statusEl = q('[data-testid="status"]', r.container);
  const statusMatches = statusEl?.textContent.includes('Selected: C (25)');

  $test.check(
    'Direct click on SVG bar triggers onSelectBar and highlights the clicked bar',
    bar2Highlighted && !!statusMatches,
    { bar2Highlighted, status: statusEl?.textContent }
  );
  r.unmount();
}
