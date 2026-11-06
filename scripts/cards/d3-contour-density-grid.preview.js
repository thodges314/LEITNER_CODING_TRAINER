const DEFAULT_DENSITY_POINTS = [
  { x: 130, y: 110, weight: 2 },
  { x: 142, y: 118, weight: 3 },
  { x: 125, y: 125, weight: 2 },
  { x: 150, y: 105, weight: 2 },
  { x: 138, y: 132, weight: 3 },
  { x: 155, y: 122, weight: 2 },
  { x: 300, y: 165, weight: 3 },
  { x: 315, y: 175, weight: 4 },
  { x: 290, y: 180, weight: 2 },
  { x: 308, y: 155, weight: 3 },
  { x: 322, y: 162, weight: 2 },
  { x: 298, y: 190, weight: 2 },
  { x: 220, y: 95, weight: 1.5 },
  { x: 230, y: 105, weight: 1.5 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      bandwidth: 24,
      thresholds: 8,
      cellSize: 4,
      showPoints: true,
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

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderContourDensity(chartBox, DEFAULT_DENSITY_POINTS, {
      width: 450,
      height: 270,
      bandwidth: typeof props.bandwidth === 'number' ? props.bandwidth : 24,
      thresholds: typeof props.thresholds === 'number' ? props.thresholds : 8,
      cellSize: typeof props.cellSize === 'number' ? props.cellSize : 4,
      showPoints: props.showPoints !== false,
      onSelectBand: function (band, idx) {
        statusBar.textContent =
          'Selected Isoline Band #' +
          idx +
          ' · Density Threshold: ' +
          band.value.toFixed(5) +
          ' · Rings: ' +
          band.ringCount;
        if (typeof log === 'function') {
          log('onSelectBand', idx, Number(band.value.toFixed(5)), band.ringCount);
        }
      },
    });

    statusBar.textContent =
      'Bands: ' +
      instance.getBands().length +
      ' · Peak Density: ' +
      instance.getPeakDensity().toFixed(5) +
      ' · Click any isoline band';
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();

