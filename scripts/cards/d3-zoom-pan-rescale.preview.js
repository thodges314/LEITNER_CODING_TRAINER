const DEFAULT_ZOOM_POINTS = [
  { x: 10, y: 35 },
  { x: 18, y: 55 },
  { x: 25, y: 40 },
  { x: 32, y: 70 },
  { x: 40, y: 25 },
  { x: 48, y: 85 },
  { x: 55, y: 60 },
  { x: 62, y: 45 },
  { x: 70, y: 90 },
  { x: 78, y: 65 },
  { x: 85, y: 30 },
  { x: 92, y: 75 },
  { x: 100, y: 50 },
  { x: 110, y: 95 },
  { x: 120, y: 80 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      width: 460,
      height: 250,
      color: 'steelblue',
      scaleExtentMin: 1,
      scaleExtentMax: 8,
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
    statusBar.textContent = 'Zoom: 1.00x | Offset: (0, 0) — Scroll wheel or drag to zoom/pan';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    try {
      instance = renderZoomChart(chartBox, DEFAULT_ZOOM_POINTS, {
        width: props.width ?? 460,
        height: props.height ?? 250,
        color: props.color ?? 'steelblue',
        scaleExtent: [props.scaleExtentMin ?? 1, props.scaleExtentMax ?? 8],
        onZoomChange: state => {
          statusBar.textContent = `Zoom: ${state.k.toFixed(2)}x | Offset: (${Math.round(state.x)}, ${Math.round(state.y)})`;
        },
      });
    } catch (err) {
      chartBox.innerHTML = `<div style="color: crimson; font-family: monospace; font-size: 12px; padding: 12px;">Error: ${err.message}</div>`;
    }
  }

  render(currentProps);

  window.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_PROPS') {
      currentProps = Object.assign({}, currentProps, event.data.props);
      render(currentProps);
    }
  });
})();

