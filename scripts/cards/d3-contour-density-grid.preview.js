const DEFAULT_DENSITY_POINTS = [
  { x: 120, y: 90 },
  { x: 125, y: 95 },
  { x: 115, y: 85 },
  { x: 130, y: 100 },
  { x: 110, y: 92 },
  { x: 122, y: 88 },
  { x: 128, y: 96 },
  { x: 310, y: 170 },
  { x: 315, y: 165 },
  { x: 305, y: 175 },
  { x: 320, y: 180 },
  { x: 298, y: 168 },
  { x: 312, y: 174 },
  { x: 325, y: 160 },
  { x: 220, y: 130 },
  { x: 225, y: 135 },
  { x: 215, y: 125 },
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

    instance = renderContourDensity(container, DEFAULT_DENSITY_POINTS, {
      width: 450,
      height: 270,
      bandwidth: typeof props.bandwidth === 'number' ? props.bandwidth : 24,
      thresholds: typeof props.thresholds === 'number' ? props.thresholds : 8,
      cellSize: typeof props.cellSize === 'number' ? props.cellSize : 4,
      showPoints: props.showPoints !== false,
      onSelectBand: function (band, idx) {
        if (typeof log === 'function') {
          log('onSelectBand', idx, Number(band.value.toFixed(5)), band.ringCount);
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
