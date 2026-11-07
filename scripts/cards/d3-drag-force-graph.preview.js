const DEFAULT_FORCE_GRAPH_DATA = {
  nodes: [
    { id: 'Alpha', group: 1 },
    { id: 'Beta', group: 1 },
    { id: 'Gamma', group: 1 },
    { id: 'Delta', group: 2 },
    { id: 'Epsilon', group: 2 },
    { id: 'Zeta', group: 3 },
    { id: 'Eta', group: 3 },
    { id: 'Theta', group: 3 },
  ],
  links: [
    { source: 'Alpha', target: 'Beta' },
    { source: 'Beta', target: 'Gamma' },
    { source: 'Gamma', target: 'Alpha' },
    { source: 'Gamma', target: 'Delta' },
    { source: 'Delta', target: 'Epsilon' },
    { source: 'Delta', target: 'Zeta' },
    { source: 'Zeta', target: 'Eta' },
    { source: 'Eta', target: 'Theta' },
    { source: 'Theta', target: 'Zeta' },
    { source: 'Beta', target: 'Delta' },
  ],
};

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      width: 460,
      height: 280,
      nodeRadius: 8,
      chargeStrength: -120,
      linkDistance: 50,
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

    instance = renderForceDirectedGraph(container, DEFAULT_FORCE_GRAPH_DATA, {
      width: Number(props.width) || 460,
      height: Number(props.height) || 280,
      nodeRadius: Number(props.nodeRadius) || 8,
      chargeStrength: Number(props.chargeStrength) || -120,
      linkDistance: Number(props.linkDistance) || 50,
      onNodeClick: function (node) {
        if (typeof log === 'function') log('nodeClick', node.id);
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
