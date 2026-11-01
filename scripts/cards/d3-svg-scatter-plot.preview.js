const DEFAULT_POINTS = [
  { x: 15, y: 30, label: 'Feature A', radius: 6 },
  { x: 25, y: 75, label: 'Feature B', radius: 8 },
  { x: 45, y: 50, label: 'Feature C', radius: 5 },
  { x: 60, y: 90, label: 'Feature D', radius: 10 },
  { x: 80, y: 40, label: 'Feature E', radius: 7 },
  { x: 95, y: 65, label: 'Feature F', radius: 9 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_POINTS,
      width: 450,
      height: 300,
      color: '#3b82f6',
      defaultRadius: 6,
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
    instance = renderScatterPlot(
      container,
      Array.isArray(props.data) ? props.data : DEFAULT_POINTS,
      {
        width: Number(props.width) || 450,
        height: Number(props.height) || 300,
        color: props.color || '#3b82f6',
        defaultRadius: Number(props.defaultRadius) || 6,
        onSelectPoint: function (datum, index) {
          if (typeof log === 'function') log('selectPoint', datum, index);
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
