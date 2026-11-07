const DEFAULT_BRUSH_SERIES = [
  { x: 0, y: 24 },
  { x: 5, y: 42 },
  { x: 10, y: 35 },
  { x: 15, y: 68 },
  { x: 20, y: 54 },
  { x: 25, y: 82 },
  { x: 30, y: 61 },
  { x: 35, y: 95 },
  { x: 40, y: 74 },
  { x: 45, y: 50 },
  { x: 50, y: 88 },
  { x: 55, y: 64 },
  { x: 60, y: 79 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_BRUSH_SERIES,
      width: 460,
      focusHeight: 165,
      contextHeight: 55,
      color: 'steelblue',
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
    wrapper.style.gap = '6px';

    const statusBar = document.createElement('div');
    statusBar.style.fontSize = '12px';
    statusBar.style.fontFamily = 'monospace';
    statusBar.style.color = 'slategray';
    statusBar.textContent = 'Drag across the lower context mini-map to brush & zoom the focus chart';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    const series =
      Array.isArray(props.data) && props.data.length > 0
        ? props.data
        : DEFAULT_BRUSH_SERIES;

    instance = renderBrushCoordinator(chartBox, series, {
      width: Number(props.width) || 460,
      focusHeight: Number(props.focusHeight) || 165,
      contextHeight: Number(props.contextHeight) || 55,
      color: props.color || 'steelblue',
      initialSelection: [10, 45],
      onBrushChange: function (domain, filtered) {
        statusBar.textContent =
          'Active X Domain: [' +
          domain[0].toFixed(1) +
          ', ' +
          domain[1].toFixed(1) +
          '] · Visible Points: ' +
          filtered.length;
        if (typeof log === 'function') {
          log('onBrushChange', [Number(domain[0].toFixed(1)), Number(domain[1].toFixed(1))], filtered.length);
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

