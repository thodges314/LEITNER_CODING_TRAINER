const DEFAULT_TREEMAP_DATA = {
  name: 'root',
  children: [
    {
      name: 'Frontend',
      children: [
        { name: 'React', value: 45 },
        { name: 'TypeScript', value: 35 },
        { name: 'D3', value: 20 },
      ],
    },
    {
      name: 'Backend',
      children: [
        { name: 'Node', value: 30 },
        { name: 'Postgres', value: 25 },
        { name: 'GraphQL', value: 15 },
      ],
    },
    {
      name: 'DevOps',
      children: [
        { name: 'Docker', value: 18 },
        { name: 'CI/CD', value: 12 },
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

    instance = renderTreemap(
      container,
      props.data && typeof props.data === 'object' ? props.data : DEFAULT_TREEMAP_DATA,
      {
        width: Number(props.width) || 480,
        height: Number(props.height) || 300,
        paddingInner: props.paddingInner !== undefined ? Number(props.paddingInner) : 3,
        paddingOuter: props.paddingOuter !== undefined ? Number(props.paddingOuter) : 3,
        round: props.round !== false,
        onSelectCell: function (cell, idx) {
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
