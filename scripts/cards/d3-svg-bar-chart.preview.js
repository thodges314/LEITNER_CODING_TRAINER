const DEFAULT_DATA = [
  { label: 'Mon', value: 24 },
  { label: 'Tue', value: 45 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 72 },
  { label: 'Fri', value: 55 },
  { label: 'Sat', value: 30 },
  { label: 'Sun', value: 42 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_DATA,
      width: 400,
      height: 260,
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
    instance = renderBarChart(
      container,
      Array.isArray(props.data) ? props.data : DEFAULT_DATA,
      {
        width: Number(props.width) || 400,
        height: Number(props.height) || 260,
        color: props.color || 'steelblue',
        onSelectBar: function (datum, index) {
          if (typeof log === 'function') log('selectBar', datum, index);
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
