function createCoordinateScales(config = {}) {
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

  function mapPoint(category, value) {
    const x = xScale(category);
    if (x === undefined) return null;
    return {
      x,
      y: yScale(value),
      barWidth: xScale.bandwidth(),
      color: colorScale(category),
    };
  }

  function invertY(pixelY) {
    return yScale.invert(pixelY);
  }

  return { xScale, yScale, colorScale, mapPoint, invertY };
}
