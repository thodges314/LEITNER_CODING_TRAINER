const DEFAULT_POINTS = [
  { id: '1', x: 10, y: 20, value: 15, label: 'A', color: 'steelblue' },
  { id: '2', x: 80, y: 75, value: 45, label: 'B', color: 'seagreen' },
  { id: '3', x: 45, y: 90, value: 30, label: 'C', color: 'crimson' },
  { id: '4', x: 70, y: 30, value: 20, label: 'D', color: 'purple' },
  { id: '5', x: 30, y: 55, value: 40, label: 'E', color: 'teal' },
];

(function() {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign({
    data: DEFAULT_POINTS,
    width: 400,
    height: 280,
  }, typeof window !== 'undefined' ? window.__previewProps : {});

  let cleanup = null;

  function render(props) {
    if (typeof cleanup === 'function') {
      try { cleanup(); } catch (_) {}
    }
    container.innerHTML = '';
    cleanup = renderCoordinateLayout(container, {
      data: props.data || DEFAULT_POINTS,
      width: Number(props.width) || 400,
      height: Number(props.height) || 280,
      onSelectPoint: function(p) {
        if (typeof log === 'function') log('selectPoint', p);
      },
    });
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function(newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
