const DEFAULT_POINTS = [
  { x: 1, y: 15 },
  { x: 2, y: 35 },
  { x: 3, y: 22 },
  { x: 4, y: 58 },
  { x: 5, y: 44 },
  { x: 6, y: 68 },
  { x: 7, y: 52 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_POINTS,
      width: 420,
      height: 260,
      strokeColor: '#38bdf8',
      strokeWidth: 2,
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
    instance = renderLineChart(
      container,
      Array.isArray(props.data) ? props.data : DEFAULT_POINTS,
      {
        width: Number(props.width) || 420,
        height: Number(props.height) || 260,
        strokeColor: props.strokeColor || '#38bdf8',
        strokeWidth: Number(props.strokeWidth) || 2,
        showPoints: props.showPoints !== false,
        onSelectPoint: function (point, index) {
          if (typeof log === 'function') log('selectPoint', point, index);
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
