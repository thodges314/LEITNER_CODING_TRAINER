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

    instance = renderZoomChart(container, DEFAULT_ZOOM_POINTS, {
      width: Number(props.width) || 460,
      height: Number(props.height) || 250,
      color: props.color || 'steelblue',
      scaleExtent: [
        Number(props.scaleExtentMin) || 1,
        Number(props.scaleExtentMax) || 8,
      ],
      onZoomChange: function (state) {
        if (typeof log === 'function') log('zoomChange', state);
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

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'UPDATE_PROPS') {
      currentProps = Object.assign({}, currentProps, event.data.props);
      render(currentProps);
    }
  });
})();
