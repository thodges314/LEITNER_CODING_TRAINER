interface ScaleConfig {
  categories: string[];
  values: number[];
  width: number;
  height: number;
  paddingInner?: number;
  clamp?: boolean;
}

interface PointMapping {
  x: number;
  y: number;
  barWidth: number;
  color: string;
}

interface CoordinateScales {
  xScale: d3.ScaleBand<string>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: d3.ScaleOrdinal<string, string>;
  mapPoint: (category: string, value: number) => PointMapping | null;
  invertY: (pixelY: number) => number;
}

function createCoordinateScales(config: ScaleConfig): CoordinateScales {
  const {
    categories = [],
    values = [],
    width = 400,
    height = 200,
    paddingInner = 0.2,
    clamp = true,
  } = config;

  const maxVal = d3.max(values);
  const upperBound = typeof maxVal === 'number' && maxVal > 0 ? maxVal : 100;

  const xScale = d3
    .scaleBand()
    .domain(categories)
    .range([0, width])
    .paddingInner(paddingInner);

  const yScale = d3
    .scaleLinear()
    .domain([0, upperBound])
    .range([height, 0])
    .clamp(Boolean(clamp));

  const colorScale = d3
    .scaleOrdinal(d3.schemeTableau10)
    .domain(categories);

  function mapPoint(category: string, value: number): PointMapping | null {
    const x = xScale(category);
    if (x === undefined) return null;
    return {
      x,
      y: yScale(value),
      barWidth: xScale.bandwidth(),
      color: colorScale(category),
    };
  }

  function invertY(pixelY: number): number {
    return yScale.invert(pixelY);
  }

  return { xScale, yScale, colorScale, mapPoint, invertY };
}
