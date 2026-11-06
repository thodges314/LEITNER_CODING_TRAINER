interface BrushPoint {
  x: number;
  y: number;
}

interface BrushCoordinatorOptions {
  width?: number;
  focusHeight?: number;
  contextHeight?: number;
  color?: string;
  initialSelection?: [number, number];
  onBrushChange?: (domain: [number, number], filteredData: BrushPoint[]) => void;
}

interface BrushCoordinatorInstance {
  svg: SVGSVGElement;
  getDomain: () => [number, number];
  getFilteredData: () => BrushPoint[];
  setBrushDomain: (domain: [number, number] | null) => void;
  destroy: () => void;
}

function renderBrushCoordinator(
  container: HTMLElement,
  data: BrushPoint[],
  options: BrushCoordinatorOptions = {}
): BrushCoordinatorInstance {
  const {
    width = 480,
    focusHeight = 200,
    contextHeight = 70,
    color = 'steelblue',
    initialSelection,
    onBrushChange,
  } = options;

  const margin = { top: 15, right: 20, bottom: 25, left: 40 };
  const gap = 25;
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const totalHeight = focusHeight + contextHeight + gap + margin.top + margin.bottom;

  container.innerHTML = '';

  const points: BrushPoint[] = Array.isArray(data) ? data : [];
  const xExt = d3.extent(points, (d: BrushPoint) => d.x);
  const fullDomain: [number, number] =
    xExt[0] !== undefined && xExt[1] !== undefined ? [xExt[0], xExt[1]] : [0, 1];
  const maxY = d3.max(points, (d: BrushPoint) => d.y);
  const yDomain: [number, number] = [0, maxY !== undefined && maxY > 0 ? maxY : 1];

  let currentDomain: [number, number] = [fullDomain[0], fullDomain[1]];

  const focusX = d3.scaleLinear().domain(currentDomain).range([0, innerWidth]);
  const focusY = d3.scaleLinear().domain(yDomain).range([focusHeight, 0]);
  const contextX = d3.scaleLinear().domain(fullDomain).range([0, innerWidth]);
  const contextY = d3.scaleLinear().domain(yDomain).range([contextHeight, 0]);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', totalHeight)
    .attr('role', 'img')
    .attr('aria-label', 'Brush coordinator chart');

  const focusGroup = svg
    .append('g')
    .attr('class', 'focus-chart')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const contextGroup = svg
    .append('g')
    .attr('class', 'context-chart')
    .attr('transform', `translate(${margin.left}, ${margin.top + focusHeight + gap})`);

  const focusLineGen = d3
    .line<BrushPoint>()
    .x((d: BrushPoint) => focusX(d.x))
    .y((d: BrushPoint) => focusY(d.y));

  const contextLineGen = d3
    .line<BrushPoint>()
    .x((d: BrushPoint) => contextX(d.x))
    .y((d: BrushPoint) => contextY(d.y));

  const focusPath = focusGroup
    .append('path')
    .attr('class', 'focus-line')
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2);

  const focusDotsGroup = focusGroup.append('g').attr('class', 'focus-dots');

  const focusXAxisGroup = focusGroup
    .append('g')
    .attr('class', 'x-axis focus-x-axis')
    .attr('transform', `translate(0, ${focusHeight})`);

  focusGroup
    .append('g')
    .attr('class', 'y-axis focus-y-axis')
    .call(d3.axisLeft(focusY));

  contextGroup
    .append('path')
    .attr('class', 'context-line')
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('stroke-width', 1.5)
    .attr('d', points.length > 0 ? contextLineGen(points) ?? '' : '');

  contextGroup
    .append('g')
    .attr('class', 'x-axis context-x-axis')
    .attr('transform', `translate(0, ${contextHeight})`)
    .call(d3.axisBottom(contextX));

  function getFilteredData(): BrushPoint[] {
    return points.filter((d) => d.x >= currentDomain[0] && d.x <= currentDomain[1]);
  }

  function updateFocusView(nextDomain: [number, number], notify: boolean): void {
    const d0 = Math.min(nextDomain[0], nextDomain[1]);
    const d1 = Math.max(nextDomain[0], nextDomain[1]);
    currentDomain = [d0, d1];
    focusX.domain(currentDomain);

    const visible = getFilteredData();
    focusPath.attr('d', visible.length > 0 ? focusLineGen(visible) ?? '' : '');

    focusDotsGroup
      .selectAll('circle.focus-dot')
      .data(visible)
      .join('circle')
      .attr('class', 'focus-dot')
      .attr('cx', (d: BrushPoint) => focusX(d.x))
      .attr('cy', (d: BrushPoint) => focusY(d.y))
      .attr('r', 3.5)
      .attr('fill', color)
      .attr('data-x', (d: BrushPoint) => String(d.x))
      .attr('data-y', (d: BrushPoint) => String(d.y));

    focusXAxisGroup.call(d3.axisBottom(focusX));

    if (notify && typeof onBrushChange === 'function') {
      onBrushChange([currentDomain[0], currentDomain[1]], visible);
    }
  }

  let handledByEvent = false;

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [innerWidth, contextHeight],
    ])
    .on('brush end', function (event: any) {
      handledByEvent = true;
      if (event && Array.isArray(event.selection)) {
        const [px0, px1] = event.selection as [number, number];
        updateFocusView([contextX.invert(px0), contextX.invert(px1)], true);
      } else {
        updateFocusView([fullDomain[0], fullDomain[1]], true);
      }
    });

  const brushGroup = contextGroup
    .append('g')
    .attr('class', 'brush-layer')
    .call(brush);

  updateFocusView(fullDomain, false);

  function setBrushDomain(domain: [number, number] | null): void {
    handledByEvent = false;
    if (domain === null || !Array.isArray(domain)) {
      try {
        brushGroup.call(brush.move, null);
      } catch {}
      if (!handledByEvent) {
        updateFocusView([fullDomain[0], fullDomain[1]], true);
      }
    } else {
      const d0 = Math.min(domain[0], domain[1]);
      const d1 = Math.max(domain[0], domain[1]);
      try {
        brushGroup.call(brush.move, [contextX(d0), contextX(d1)]);
      } catch {}
      if (!handledByEvent) {
        updateFocusView([d0, d1], true);
      }
    }
  }

  if (Array.isArray(initialSelection) && initialSelection.length === 2) {
    setBrushDomain(initialSelection);
  }

  return {
    svg: svg.node() as SVGSVGElement,
    getDomain() {
      return [currentDomain[0], currentDomain[1]];
    },
    getFilteredData,
    setBrushDomain,
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}

