const DEFAULT_GEO_COLLECTION = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'WEST',
      properties: { name: 'Pacific Coast' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-124, 38],
            [-124, 48],
            [-112, 48],
            [-112, 38],
            [-124, 38],
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
      fillColor: 'slategray',
      activeColor: 'steelblue',
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

    instance = renderGeoMap(container, DEFAULT_GEO_COLLECTION, {
      width: 450,
      height: 270,
      projectionType: props.projectionType || 'mercator',
      padding: typeof props.padding === 'number' ? props.padding : 20,
      fillColor: props.fillColor || 'slategray',
      activeColor: props.activeColor || 'steelblue',
      showCentroids: props.showCentroids !== false,
      onSelectFeature: function (_feature, metric, idx) {
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
