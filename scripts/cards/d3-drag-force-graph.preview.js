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

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '6px';

    const statusBar = document.createElement('div');
    statusBar.style.fontSize = '12px';
    statusBar.style.fontFamily = 'monospace';
    statusBar.style.color = 'slategray';
    statusBar.textContent = 'Drag nodes to reheat physics and reposition | Click a node to inspect';

    const chartBox = document.createElement('div');
    wrapper.appendChild(statusBar);
    wrapper.appendChild(chartBox);
    container.appendChild(wrapper);

    try {
      instance = renderForceDirectedGraph(chartBox, DEFAULT_FORCE_GRAPH_DATA, {
        width: props.width ?? 460,
        height: props.height ?? 280,
        nodeRadius: props.nodeRadius ?? 8,
        chargeStrength: props.chargeStrength ?? -120,
        linkDistance: props.linkDistance ?? 50,
        onNodeClick: node => {
          statusBar.textContent = `Selected Node: "${node.id}" (group: ${node.group ?? 1})`;
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
