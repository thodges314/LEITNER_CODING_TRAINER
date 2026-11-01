const DEFAULT_DATA = [
  { label: 'React', value: 40, color: '#38bdf8' },
  { label: 'Vue', value: 25, color: '#4ade80' },
  { label: 'Svelte', value: 20, color: '#fb923c' },
  { label: 'Angular', value: 15, color: '#f87171' },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_DATA,
      width: 400,
      height: 300,
      innerRadius: 60,
      centerLabel: 'Ecosystem',
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
    instance = renderDonutChart(
      container,
      Array.isArray(props.data) ? props.data : DEFAULT_DATA,
      {
        width: Number(props.width) || 400,
        height: Number(props.height) || 300,
        innerRadius: Number(props.innerRadius) !== undefined ? Number(props.innerRadius) : 60,
        centerLabel: props.centerLabel || '',
        onSelectSlice: function (datum, index) {
          if (typeof log === 'function') log('selectSlice', datum, index);
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
