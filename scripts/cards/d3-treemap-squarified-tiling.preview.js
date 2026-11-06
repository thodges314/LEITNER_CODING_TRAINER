const DEFAULT_TREEMAP_DATA = {
  name: 'Frontend Bundle',
  children: [
    {
      name: 'Framework',
      children: [
        { name: 'react-dom', value: 420 },
        { name: 'router', value: 160 },
        { name: 'state', value: 95 },
      ],
    },
    {
      name: 'Visualization',
      children: [
        { name: 'd3-hierarchy', value: 240 },
        { name: 'd3-shape', value: 190 },
        { name: 'd3-scale', value: 145 },
      ],
    },
    {
      name: 'Editor',
      children: [
        { name: 'codemirror', value: 310 },
        { name: 'typescript-worker', value: 275 },
      ],
    },
  ],
};

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_TREEMAP_DATA,
      width: 480,
      height: 300,
      paddingInner: 3,
      paddingOuter: 3,
      round: true,
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

    const statusBar = document.createElement('div');
    statusBar.style.fontSize = '12px';
    statusBar.style.fontFamily = 'monospace';
    statusBar.style.color = '#94a3b8';
    statusBar.textContent = 'Click any treemap leaf cell to inspect its area & value';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    instance = renderTreemap(
      chartBox,
      props.data && typeof props.data === 'object' ? props.data : DEFAULT_TREEMAP_DATA,
      {
        width: Number(props.width) || 480,
        height: Number(props.height) || 300,
        paddingInner: props.paddingInner !== undefined ? Number(props.paddingInner) : 3,
        paddingOuter: props.paddingOuter !== undefined ? Number(props.paddingOuter) : 3,
        round: props.round !== false,
        onSelectCell: function (cell, idx) {
          statusBar.textContent =
            'Selected #' +
            idx +
            ': ' +
            cell.name +
            ' (value=' +
            cell.value +
            ', ' +
            Math.round(cell.width) +
            'x' +
            Math.round(cell.height) +
            'px)';
          if (typeof log === 'function') log('onSelectCell', cell, idx);
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

