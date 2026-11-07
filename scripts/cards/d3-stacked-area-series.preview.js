const DEFAULT_MONTHLY_METRICS = [
  { month: 'Jan', desktop: 120, mobile: 80, tablet: 20 },
  { month: 'Feb', desktop: 140, mobile: 110, tablet: 25 },
  { month: 'Mar', desktop: 165, mobile: 130, tablet: 35 },
  { month: 'Apr', desktop: 190, mobile: 155, tablet: 45 },
  { month: 'May', desktop: 210, mobile: 180, tablet: 40 },
  { month: 'Jun', desktop: 240, mobile: 205, tablet: 50 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      width: 460,
      height: 260,
      keys: ['desktop', 'mobile', 'tablet'],
      colors: ['steelblue', 'seagreen', 'orange'],
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

    instance = renderStackedAreaChart(container, DEFAULT_MONTHLY_METRICS, {
      width: Number(props.width) || 460,
      height: Number(props.height) || 260,
      keys: props.keys || ['desktop', 'mobile', 'tablet'],
      colors: props.colors || ['steelblue', 'seagreen', 'orange'],
      onSelectLayer: function (key, index) {
        if (typeof log === 'function') log('selectLayer', key, index);
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
