const SAMPLE_CONFIG = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  values: [20, 50, 100],
  width: 500,
  height: 200,
  paddingInner: 0.25,
  clamp: true,
};

// 1. Constructs band xScale across [0, width] with correct domain, range, and bandwidth
{
  const scales = createCoordinateScales(SAMPLE_CONFIG);
  const xMon = scales.xScale('Mon');
  const xFri = scales.xScale('Fri');
  const bw = scales.xScale.bandwidth();
  const unknown = scales.xScale('Sat');

  const passed =
    typeof xMon === 'number' &&
    Math.abs(xMon) < 1e-4 &&
    typeof xFri === 'number' &&
    xFri > xMon &&
    typeof bw === 'number' &&
    bw > 0 &&
    unknown === undefined;

  $test.check(
    'Constructs band xScale across [0, width] with correct domain, range, and bandwidth',
    passed,
    { xMon, xFri, bandwidth: bw, unknown }
  );
}

// 2. Constructs linear yScale with inverted range [height, 0] and domain clamping
{
  const scales = createCoordinateScales(SAMPLE_CONFIG);
  const y0 = scales.yScale(0);
  const y50 = scales.yScale(50);
  const y100 = scales.yScale(100);
  const yOver = scales.yScale(150);

  const passed =
    y0 === 200 &&
    y50 === 100 &&
    y100 === 0 &&
    yOver === 0;

  $test.check(
    'Constructs linear yScale with inverted range [height, 0] and domain clamping',
    passed,
    { y0, y50, y100, yOver }
  );
}

// 3. Constructs ordinal colorScale mapping categories to d3.schemeTableau10
{
  const scales = createCoordinateScales(SAMPLE_CONFIG);
  const c0 = scales.colorScale('Mon');
  const c1 = scales.colorScale('Tue');
  const c2 = scales.colorScale('Wed');

  const passed =
    c0 === d3.schemeTableau10[0] &&
    c1 === d3.schemeTableau10[1] &&
    c2 === d3.schemeTableau10[2];

  $test.check(
    'Constructs ordinal colorScale mapping categories to d3.schemeTableau10',
    passed,
    { c0, c1, c2 }
  );
}

// 4. Maps valid and invalid category points to coordinate geometry and color
{
  const scales = createCoordinateScales(SAMPLE_CONFIG);
  const pt = scales.mapPoint('Wed', 50);
  const missing = scales.mapPoint('Sun', 50);

  const passed =
    pt !== null &&
    typeof pt.x === 'number' &&
    pt.y === 100 &&
    typeof pt.barWidth === 'number' &&
    pt.barWidth > 0 &&
    pt.color === d3.schemeTableau10[2] &&
    missing === null;

  $test.check(
    'Maps valid and invalid category points to coordinate geometry and color',
    passed,
    { pt, missing }
  );
}

// 5. Inverts visual Y pixel coordinates back to original domain values
{
  const scales = createCoordinateScales(SAMPLE_CONFIG);
  const vBottom = scales.invertY(200);
  const vMid = scales.invertY(100);
  const vTop = scales.invertY(0);

  const passed =
    Math.round(vBottom) === 0 &&
    Math.round(vMid) === 50 &&
    Math.round(vTop) === 100;

  $test.check(
    'Inverts visual Y pixel coordinates back to original domain values',
    passed,
    { vBottom, vMid, vTop }
  );
}
