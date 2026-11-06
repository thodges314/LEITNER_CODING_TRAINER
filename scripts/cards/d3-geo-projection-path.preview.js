const DEFAULT_GEO_COLLECTION = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'NW',
      properties: { name: 'Northwest Territory' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-125, 42],
            [-125, 50],
            [-112, 50],
            [-112, 42],
            [-125, 42],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'SW',
      properties: { name: 'Southwest Mesa' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-124, 32],
            [-124, 41.5],
            [-110, 41.5],
            [-110, 32],
            [-124, 32],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'CENTRAL',
      properties: { name: 'Central Plains' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-111.5, 34],
            [-111.5, 48],
            [-96, 48],
            [-96, 34],
            [-111.5, 34],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'EAST',
      properties: { name: 'Atlantic Seaboard' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-95.5, 33],
            [-95.5, 46],
            [-76, 46],
            [-80, 33],
            [-95.5, 33],
          ],
        ],
      },
    },
  ],
};

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      projectionType: 'mercator',
      padding: 20,
      fillColor: '#1e293b',
      activeColor: '#3b82f6',
      showCentroids: true,
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  let instance = null;

  function render(props) {
    if (instance && typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (_) {}
    }
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '8px';

    const statusBar = document.createElement('div');
    statusBar.style.fontSize = '12px';
    statusBar.style.fontFamily = 'monospace';
    statusBar.style.color = '#94a3b8';
    statusBar.textContent =
      'Projection: ' + (props.projectionType || 'mercator') + ' · Click any region polygon';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderGeoMap(chartBox, DEFAULT_GEO_COLLECTION, {
      width: 450,
      height: 270,
      projectionType: props.projectionType || 'mercator',
      padding: typeof props.padding === 'number' ? props.padding : 20,
      fillColor: props.fillColor || '#1e293b',
      activeColor: props.activeColor || '#3b82f6',
      showCentroids: props.showCentroids !== false,
      onSelectFeature: function (_feature, metric, idx) {
        statusBar.textContent =
          'Selected #' +
          idx +
          ': ' +
          metric.name +
          ' · Centroid (' +
          Math.round(metric.x) +
          ', ' +
          Math.round(metric.y) +
          ') · Area ' +
          Math.round(metric.area) +
          'px²';
        if (typeof log === 'function') {
          log('onSelectFeature', metric.id, metric.name, Math.round(metric.area));
        }
      },
    });
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
