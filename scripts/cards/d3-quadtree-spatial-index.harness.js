const SAMPLE_POINTS = [
  { x: 10, y: 20, id: 'A' },
  { x: 50, y: 80, id: 'B' },
  { x: 90, y: 40, id: 'C' },
];

// 1. Initializes 2D quadtree and returns size and extent
{
  const index = createQuadtreeIndex(SAMPLE_POINTS);
  const size = index.size();
  const extent = index.extent();

  const passed =
    size === 3 &&
    Array.isArray(extent) &&
    extent.length === 2 &&
    extent[0][0] <= 10 &&
    extent[0][1] <= 20 &&
    extent[1][0] >= 90 &&
    extent[1][1] >= 80;

  $test.check(
    'Initializes 2D quadtree and returns size and extent',
    passed,
    `Expected size 3 and bounding extent covering (10..90, 20..80); got size=${size}, extent=${JSON.stringify(extent)}`
  );
}

// 2. Finds single nearest point without distance constraint
{
  const index = createQuadtreeIndex(SAMPLE_POINTS);
  const nearA = index.findNearest(12, 22);
  const nearC = index.findNearest(88, 42);

  const passed =
    nearA !== null &&
    nearA.id === 'A' &&
    nearC !== null &&
    nearC.id === 'C';

  $test.check(
    'Finds single nearest point without distance constraint',
    passed,
    `Expected nearest to (12, 22) to be "A" and (88, 42) to be "C"; got nearA=${nearA?.id}, nearC=${nearC?.id}`
  );
}

// 3. Respects maximum search radius constraint in findNearest
{
  const index = createQuadtreeIndex(SAMPLE_POINTS);
  // Distance from (12, 22) to A(10, 20) is Math.hypot(2, 2) ~ 2.828
  const withinRadius = index.findNearest(12, 22, 5);
  const outsideRadius = index.findNearest(12, 22, 1);

  const passed =
    withinRadius !== null &&
    withinRadius.id === 'A' &&
    outsideRadius === null;

  $test.check(
    'Respects maximum search radius constraint in findNearest',
    passed,
    `Expected radius 5 to find "A" and radius 1 to return null; got within=${withinRadius?.id}, outside=${outsideRadius}`
  );
}

// 4. Collects multiple points within radius using pruned quad visit
{
  const index = createQuadtreeIndex(SAMPLE_POINTS);
  // Point (30, 50) with radius 45:
  // dist to A(10, 20) = sqrt(20^2 + 30^2) = sqrt(1300) ~ 36.05 <= 45
  // dist to B(50, 80) = sqrt(20^2 + 30^2) = sqrt(1300) ~ 36.05 <= 45
  // dist to C(90, 40) = sqrt(60^2 + 10^2) = sqrt(3700) ~ 60.82 > 45
  const matches = index.findPointsInRadius(30, 50, 45);
  const matchIds = matches.map((p) => p.id).sort();

  const passed =
    matches.length === 2 &&
    matchIds[0] === 'A' &&
    matchIds[1] === 'B';

  $test.check(
    'Collects multiple points within radius using pruned quad visit',
    passed,
    `Expected matches ["A", "B"]; got ${JSON.stringify(matchIds)}`
  );
}

// 5. Supports incremental point insertion with add and addAll chaining
{
  const index = createQuadtreeIndex();
  const initialSize = index.size();

  const chained = index
    .add({ x: 5, y: 5, id: 'P1' })
    .addAll([
      { x: 15, y: 15, id: 'P2' },
      { x: 25, y: 25, id: 'P3' },
    ]);

  const afterSize = index.size();
  const nearest = index.findNearest(4, 4);

  const passed =
    initialSize === 0 &&
    afterSize === 3 &&
    chained === index &&
    nearest !== null &&
    nearest.id === 'P1';

  $test.check(
    'Supports incremental point insertion with add and addAll chaining',
    passed,
    `Expected chained add/addAll to populate 3 points with nearest P1; got initial=${initialSize}, after=${afterSize}, nearest=${nearest?.id}`
  );
}

// 6. Handles overlapping coincident points and empty index gracefully
{
  const emptyIndex = createQuadtreeIndex();
  const emptyNearest = emptyIndex.findNearest(10, 10);
  const emptyRadius = emptyIndex.findPointsInRadius(10, 10, 50);

  const dupIndex = createQuadtreeIndex([
    { x: 30, y: 30, id: 'dup1' },
    { x: 30, y: 30, id: 'dup2' },
    { x: 70, y: 70, id: 'other' },
  ]);

  const dupMatches = dupIndex.findPointsInRadius(30, 30, 5);
  const dupIds = dupMatches.map((p) => p.id).sort();

  const passed =
    emptyNearest === null &&
    Array.isArray(emptyRadius) &&
    emptyRadius.length === 0 &&
    dupMatches.length === 2 &&
    dupIds[0] === 'dup1' &&
    dupIds[1] === 'dup2';

  $test.check(
    'Handles overlapping coincident points and empty index gracefully',
    passed,
    `Expected empty index to yield null/[] and coincident points to return both items; got emptyNearest=${emptyNearest}, dupIds=${JSON.stringify(dupIds)}`
  );
}
