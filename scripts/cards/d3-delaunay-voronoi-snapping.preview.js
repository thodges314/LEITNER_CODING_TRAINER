const DEFAULT_VORONOI_POINTS = [
  { id: 'alpha', label: 'Alpha', x: 75, y: 80 },
  { id: 'beta', label: 'Beta', x: 200, y: 65 },
  { id: 'gamma', label: 'Gamma', x: 340, y: 95 },
  { id: 'delta', label: 'Delta', x: 120, y: 190 },
  { id: 'epsilon', label: 'Epsilon', x: 250, y: 175 },
  { id: 'zeta', label: 'Zeta', x: 380, y: 220 },
  { id: 'eta', label: 'Eta', x: 180, y: 260 },
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

    instance = renderVoronoiSnapping(
      container,
      Array.isArray(props.points) ? props.points : DEFAULT_VORONOI_POINTS,
      {
        width: Number(props.width) || 450,
        height: Number(props.height) || 290,
        pointRadius: Number(props.pointRadius) || 5,
        pointColor: props.pointColor || 'steelblue',
        activeColor: props.activeColor || 'orange',
        showCells: props.showCells !== false,
        onSelectPoint: function (pt, idx) {
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
