const DEFAULT_VORONOI_POINTS = [
  { x: 65, y: 55, id: 'p0', label: 'Sensor A' },
  { x: 185, y: 70, id: 'p1', label: 'Sensor B' },
  { x: 340, y: 65, id: 'p2', label: 'Sensor C' },
  { x: 110, y: 155, id: 'p3', label: 'Sensor D' },
  { x: 245, y: 150, id: 'p4', label: 'Sensor E' },
  { x: 380, y: 175, id: 'p5', label: 'Sensor F' },
  { x: 80, y: 240, id: 'p6', label: 'Sensor G' },
  { x: 215, y: 235, id: 'p7', label: 'Sensor H' },
  { x: 335, y: 245, id: 'p8', label: 'Sensor I' },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      points: DEFAULT_VORONOI_POINTS,
      width: 450,
      height: 290,
      pointRadius: 5,
      pointColor: 'steelblue',
      activeColor: 'orange',
      showCells: true,
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
    statusBar.style.color = 'slategray';
    statusBar.textContent = 'Click any Voronoi polygon cell to snap to its point (hover uses CSS :hover)';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderVoronoiSnapping(
      chartBox,
      Array.isArray(props.points) ? props.points : DEFAULT_VORONOI_POINTS,
      {
        width: Number(props.width) || 450,
        height: Number(props.height) || 290,
        pointRadius: Number(props.pointRadius) || 5,
        pointColor: props.pointColor || 'steelblue',
        activeColor: props.activeColor || 'orange',
        showCells: props.showCells !== false,
        onSelectPoint: function (pt, idx) {
          statusBar.textContent =
            'Selected cell #' + idx + ': ' + (pt.label || pt.id || '') + ' (' + pt.x + ', ' + pt.y + ')';
          if (typeof log === 'function') log('onSelectPoint', pt, idx);
        },
      }
    );
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
