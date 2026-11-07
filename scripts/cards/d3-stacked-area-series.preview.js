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

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '6px';

    const statusBar = document.createElement('div');
    statusBar.style.fontSize = '12px';
    statusBar.style.fontFamily = 'monospace';
    statusBar.style.color = 'slategray';
    statusBar.textContent = 'Click on any stacked area layer to select';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    try {
      instance = renderStackedAreaChart(chartBox, DEFAULT_MONTHLY_METRICS, {
        width: props.width ?? 460,
        height: props.height ?? 260,
        keys: props.keys ?? ['desktop', 'mobile', 'tablet'],
        colors: props.colors ?? ['steelblue', 'seagreen', 'orange'],
        onSelectLayer: (key, index) => {
          statusBar.textContent = `Selected Layer: "${key}" (index: ${index})`;
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
