interface BarDataPoint {
  label: string;
  value: number;
}

interface D3BarChartHandle {
  highlight: (index: number) => void;
  resetHighlight: () => void;
  getHighlightedIndex: () => number | null;
}

interface D3BarChartProps {
  data: BarDataPoint[];
  width?: number;
  height?: number;
  onSelectBar?: (item: BarDataPoint | null, index: number | null) => void;
}

interface ChartDashboardProps {
  data: BarDataPoint[];
  width?: number;
  height?: number;
}

const D3BarChart = forwardRef<D3BarChartHandle, D3BarChartProps>(function D3BarChart(
  { data, width = 300, height = 150, onSelectBar }: D3BarChartProps,
  ref: any
) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const highlightedRef = useRef<number | null>(null);
  highlightedRef.current = highlightedIndex;

  const selectBar = useCallback(
    (index: number | null) => {
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
      highlight(index: number) {
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
      .domain(data.map((_: any, i: number) => String(i)))
      .range([margin.left, margin.left + chartWidth])
      .padding(0.2);

    const maxVal = d3.max(data, (d: BarDataPoint) => d.value) || 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([margin.top + chartHeight, margin.top]);

    const bars = svg.selectAll('rect').data(data, (_: any, i: number) => String(i));

    bars.exit().remove();

    bars
      .enter()
      .append('rect')
      .merge(bars)
      .attr('data-index', (_: any, i: number) => i)
      .attr('data-label', (d: BarDataPoint) => d.label)
      .attr('data-value', (d: BarDataPoint) => d.value)
      .attr('x', (_: any, i: number) => x(String(i)) || 0)
      .attr('y', (d: BarDataPoint) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: BarDataPoint) => Math.max(0, margin.top + chartHeight - y(d.value)))
      .attr('data-highlighted', (_: any, i: number) => (i === highlightedIndex ? 'true' : 'false'))
      .attr('fill', (_: any, i: number) => (i === highlightedIndex ? 'orange' : 'steelblue'))
      .on('click', (_: any, d: BarDataPoint) => {
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

function ChartDashboard({ data, width = 300, height = 150 }: ChartDashboardProps) {
  const chartRef = useRef<D3BarChartHandle | null>(null);
  const [selected, setSelected] = useState<BarDataPoint | null>(null);

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
        onSelectBar={(item: BarDataPoint | null) => setSelected(item)}
      />
    </div>
  );
}
