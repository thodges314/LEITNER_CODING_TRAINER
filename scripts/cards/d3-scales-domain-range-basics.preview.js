const DEFAULT_SCALE_DATA = [
  { category: 'Mon', value: 35 },
  { category: 'Tue', value: 68 },
  { category: 'Wed', value: 92 },
  { category: 'Thu', value: 54 },
  { category: 'Fri', value: 80 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      padding: 32,
      paddingInner: 0.25,
      clamp: true,
      barColor: '#6366f1',
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

    const readout = document.createElement('div');
    readout.style.fontSize = '12px';
    readout.style.fontFamily = 'monospace';
    readout.style.color = '#94a3b8';

    const chartBox = document.createElement('div');
    wrapper.appendChild(readout);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderScaledCoordinateChart(chartBox, DEFAULT_SCALE_DATA, {
      width: 440,
      height: 230,
      padding: typeof props.padding === 'number' ? props.padding : 32,
      paddingInner: typeof props.paddingInner === 'number' ? props.paddingInner : 0.25,
      clamp: props.clamp !== false,
      barColor: props.barColor || '#6366f1',
    });

    const extent = instance.getDomainExtent();
    readout.textContent =
      'Domain extent: [' +
      extent[0] +
      ', ' +
      extent[1] +
      '] · Hover SVG to test yScale.invert(pixelY)';

    const svgEl = chartBox.querySelector('svg');
    if (svgEl) {
      svgEl.style.cursor = 'crosshair';
      svgEl.addEventListener('mousemove', function (e) {
        const rect = svgEl.getBoundingClientRect();
        const py = Math.round(e.clientY - rect.top);
        const inverted = instance.invertY(py);
        readout.textContent =
          'Cursor Y=' +
          py +
          'px → yScale.invert(' +
          py +
          ') = ' +
          inverted.toFixed(1) +
          ' (Domain [' +
          extent[0] +
          ', ' +
          extent[1] +
          '])';
      });
    }
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();

