interface CoordinatePoint {
  id: string;
  x: number;
  y: number;
  value: number;
  label: string;
  color?: string;
}

interface CoordinateLayoutOptions {
  data: CoordinatePoint[];
  width?: number;
  height?: number;
  onSelectPoint?: (point: CoordinatePoint) => void;
}

function renderCoordinateLayout(
  container: HTMLElement,
  options: CoordinateLayoutOptions
): () => void {
  const {
    data = [],
    width = 400,
    height = 300,
    onSelectPoint,
  } = options;

  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.width = width + 'px';
  container.style.height = height + 'px';

  const padding = 20;

  const xExtent = d3.extent(data, (d: CoordinatePoint) => d.x);
  const xDomain =
    xExtent[0] === undefined || xExtent[0] === xExtent[1]
      ? [0, 100]
      : xExtent;
  const xScale = d3.scaleLinear().domain(xDomain).range([padding, width - padding]);

  const yExtent = d3.extent(data, (d: CoordinatePoint) => d.y);
  const yDomain =
    yExtent[0] === undefined || yExtent[0] === yExtent[1]
      ? [0, 100]
      : yExtent;
  const yScale = d3.scaleLinear().domain(yDomain).range([height - padding, padding]);

  const valExtent = d3.extent(data, (d: CoordinatePoint) => d.value);
  const hasDistinctValues =
    valExtent[0] !== undefined && valExtent[0] !== valExtent[1];
  const sizeScale: (val: number) => number = hasDistinctValues
    ? d3.scaleSqrt().domain(valExtent).range([16, 48])
    : () => 32;

  let selectedId: string | null = null;
  const pointElements: Array<{
    el: HTMLDivElement;
    point: CoordinatePoint;
    clickHandler: () => void;
  }> = [];

  const updateSelections = () => {
    pointElements.forEach(({ el, point }) => {
      const isSelected = point.id === selectedId;
      el.setAttribute('data-selected', isSelected ? 'true' : 'false');
      el.style.backgroundColor = isSelected ? 'orange' : (point.color || 'steelblue');
    });
  };

  data.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'coordinate-point';
    el.setAttribute('data-point-id', p.id);
    el.setAttribute('data-label', p.label);
    el.setAttribute('data-x', String(p.x));
    el.setAttribute('data-y', String(p.y));
    el.setAttribute('data-selected', 'false');

    const size = sizeScale(p.value);
    const left = xScale(p.x) - size / 2;
    const top = yScale(p.y) - size / 2;

    el.style.position = 'absolute';
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = p.color || 'steelblue';
    el.textContent = p.label;

    const clickHandler = () => {
      selectedId = p.id;
      updateSelections();
      if (typeof onSelectPoint === 'function') {
        onSelectPoint(p);
      }
    };

    el.addEventListener('click', clickHandler);
    container.appendChild(el);
    pointElements.push({ el, point: p, clickHandler });
  });

  return () => {
    pointElements.forEach(({ el, clickHandler }) => {
      el.removeEventListener('click', clickHandler);
    });
    container.innerHTML = '';
  };
}
