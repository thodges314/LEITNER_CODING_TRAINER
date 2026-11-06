const SAMPLE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'WEST',
      properties: { name: 'West Basin' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-120, 35],
            [-120, 45],
            [-110, 45],
            [-110, 35],
            [-120, 35],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'EAST',
      properties: { name: 'East Ridge' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-105, 35],
            [-105, 45],
            [-95, 45],
            [-95, 35],
            [-105, 35],
          ],
        ],
      },
    },
  ],
};

// 1. Mounts SVG container with role, aria-label, and feature/centroid groups
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderGeoMap(container, SAMPLE_GEOJSON, {
    width: 500,
    height: 320,
  });

  const svg = container.querySelector('svg');
  const featuresGroup = container.querySelector('g.map-features');
  const centroidsGroup = container.querySelector('g.map-centroids');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '500' &&
    svg.getAttribute('height') === '320' &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Geographic map' &&
    featuresGroup !== null &&
    centroidsGroup !== null &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG container with role, aria-label, and feature/centroid groups',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Projects GeoJSON features into closed SVG paths and computes centroids
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderGeoMap(container, SAMPLE_GEOJSON, {
    width: 480,
    height: 300,
    padding: 20,
  });

  const paths = Array.from(container.querySelectorAll('path.geo-feature'));
  const centroidCircles = Array.from(container.querySelectorAll('circle.geo-centroid'));
  const centroids = instance.getCentroids();

  const validPaths = paths.every((p) => {
    const d = p.getAttribute('d') || '';
    return d.startsWith('M') && d.endsWith('Z');
  });

  const passed =
    paths.length === 2 &&
    centroidCircles.length === 2 &&
    centroids.length === 2 &&
    validPaths &&
    centroids[0].id === 'WEST' &&
    centroids[0].name === 'West Basin' &&
    centroids[1].id === 'EAST' &&
    centroids[0].x < centroids[1].x &&
    centroids[0].area > 0 &&
    centroids[1].area > 0;

  $test.check(
    'Projects GeoJSON features into closed SVG paths and computes centroids',
    passed,
    { centroids, validPaths }
  );

  instance.destroy();
  container.remove();
}

// 3. Supports projectionType switching and projectCoordinate lookup
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const mercatorMap = renderGeoMap(container, SAMPLE_GEOJSON, {
    projectionType: 'mercator',
  });
  const ptMercator = mercatorMap.projectCoordinate([-115, 40]);
  mercatorMap.destroy();

  const equiMap = renderGeoMap(container, SAMPLE_GEOJSON, {
    projectionType: 'equirectangular',
  });
  const ptEqui = equiMap.projectCoordinate([-115, 40]);
  equiMap.destroy();

  const passed =
    Array.isArray(ptMercator) &&
    ptMercator.length === 2 &&
    Number.isFinite(ptMercator[0]) &&
    Number.isFinite(ptMercator[1]) &&
    Array.isArray(ptEqui) &&
    ptEqui.length === 2 &&
    Math.abs(ptMercator[1] - ptEqui[1]) > 0.01;

  $test.check(
    'Supports projectionType switching and projectCoordinate lookup',
    passed,
    { ptMercator, ptEqui }
  );

  container.remove();
}

// 4. Clicking a feature highlights it and triggers onSelectFeature with metric
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedFeature = null;
  let selectedMetric = null;
  let selectedIdx = null;

  const instance = renderGeoMap(container, SAMPLE_GEOJSON, {
    fillColor: '#1e293b',
    activeColor: '#10b981',
    onSelectFeature: (f, m, idx) => {
      selectedFeature = f;
      selectedMetric = m;
      selectedIdx = idx;
    },
  });

  const paths = container.querySelectorAll('path.geo-feature');
  paths[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const passed =
    selectedFeature !== null &&
    selectedFeature.id === 'EAST' &&
    selectedMetric !== null &&
    selectedMetric.name === 'East Ridge' &&
    selectedIdx === 1 &&
    paths[1].getAttribute('data-active') === 'true' &&
    paths[1].getAttribute('fill') === '#10b981' &&
    paths[0].getAttribute('data-active') === 'false' &&
    paths[0].getAttribute('fill') === '#1e293b';

  $test.check(
    'Clicking a feature highlights it and triggers onSelectFeature with metric',
    passed,
    { selectedIdx, selectedMetric }
  );

  instance.destroy();
  container.remove();
}

// 5. Respects showCentroids: false by omitting centroid markers
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderGeoMap(container, SAMPLE_GEOJSON, {
    showCentroids: false,
  });

  const featureCount = container.querySelectorAll('path.geo-feature').length;
  const centroidCount = container.querySelectorAll('circle.geo-centroid').length;
  const computedCentroids = instance.getCentroids().length;

  const passed =
    featureCount === 2 && centroidCount === 0 && computedCentroids === 2;

  $test.check(
    'Respects showCentroids: false by omitting centroid markers',
    passed,
    { featureCount, centroidCount, computedCentroids }
  );

  instance.destroy();
  container.remove();
}

// 6. Handles empty FeatureCollection gracefully and cleans up on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const emptyMap = renderGeoMap(container, { type: 'FeatureCollection', features: [] });
  const centroids = emptyMap.getCentroids();
  emptyMap.destroy();
  const cleanedUp = container.innerHTML === '';

  const passed =
    Array.isArray(centroids) && centroids.length === 0 && cleanedUp;

  $test.check(
    'Handles empty FeatureCollection gracefully and cleans up on destroy',
    passed,
    { centroidsLength: centroids.length, cleanedUp }
  );

  container.remove();
}
