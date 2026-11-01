const D3BarChart = forwardRef(function D3BarChart(
  { data, width = 300, height = 150, onSelectBar },
  ref
) {
  const svgRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const highlightedRef = useRef(null);
  highlightedRef.current = highlightedIndex;

  const selectBar = useCallback(
    (index) => {
      if (index === null || index < 0 || !data || index >= data.length) {
        setHighlightedIndex(null);
        if (typeof onSelectBar === 'function') onSelectBar(null, null);
      } else {
        setHighlightedIndex(index);
        if (typeof onSelectBar === 'function') onSelectBar(data[index], index);
      }
    },
    [data, onSelectBar]
  );

  useImperativeHandle(
    ref,
    () => ({
      highlight(index) {
        selectBar(index);
      },
      resetHighlight() {
        selectBar(null);
      },
      getHighlightedIndex() {
        return highlightedRef.current;
      },
    }),
    [selectBar]
  );

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const chartWidth = Math.max(0, width - margin.left - margin.right);
    const chartHeight = Math.max(0, height - margin.top - margin.bottom);

    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => String(i)))
      .range([margin.left, margin.left + chartWidth])
      .padding(0.2);

    const maxVal = d3.max(data, (d) => d.value) || 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([margin.top + chartHeight, margin.top]);

    const bars = svg.selectAll('rect').data(data, (_, i) => String(i));

    bars.exit().remove();

    bars
      .enter()
      .append('rect')
      .merge(bars)
      .attr('data-index', (_, i) => i)
      .attr('data-label', (d) => d.label)
      .attr('data-value', (d) => d.value)
      .attr('x', (_, i) => x(String(i)) || 0)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => Math.max(0, margin.top + chartHeight - y(d.value)))
      .attr('data-highlighted', (_, i) => (i === highlightedIndex ? 'true' : 'false'))
      .attr('fill', (_, i) => (i === highlightedIndex ? '#38bdf8' : '#64748b'))
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        const idx = data.indexOf(d);
        selectBar(idx);
      });
  }, [data, width, height, highlightedIndex, selectBar]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      role="img"
      aria-label="Bar chart"
    />
  );
});

function ChartDashboard({ data, width = 300, height = 150 }) {
  const chartRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const handleHighlightMax = () => {
    if (!data || data.length === 0) return;
    let maxIdx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].value > data[maxIdx].value) {
        maxIdx = i;
      }
    }
    chartRef.current?.highlight(maxIdx);
  };

  const handleHighlightFirst = () => {
    if (data && data.length > 0) {
      chartRef.current?.highlight(0);
    }
  };

  const handleReset = () => {
    chartRef.current?.resetHighlight();
  };

  return (
    <div className="chart-dashboard">
      <div className="chart-controls">
        <button
          type="button"
          data-action="highlight-max"
          onClick={handleHighlightMax}
        >
          Highlight Max
        </button>
        <button
          type="button"
          data-action="highlight-first"
          onClick={handleHighlightFirst}
        >
          Highlight First
        </button>
        <button
          type="button"
          data-action="reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div data-testid="status">
        {selected ? `Selected: ${selected.label} (${selected.value})` : 'No selection'}
      </div>

      <D3BarChart
        ref={chartRef}
        data={data}
        width={width}
        height={height}
        onSelectBar={(item) => setSelected(item)}
      />
    </div>
  );
}
