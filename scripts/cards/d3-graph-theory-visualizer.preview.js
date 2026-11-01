const DEFAULT_NODES = [
  { id: '1', label: 'Router' },
  { id: '2', label: 'Server A' },
  { id: '3', label: 'Server B' },
  { id: '4', label: 'Client 1' },
  { id: '5', label: 'Client 2' },
];

const DEFAULT_LINKS = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '5' },
];

(function() {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign({
    nodes: DEFAULT_NODES,
    links: DEFAULT_LINKS,
    width: 400,
    height: 300,
  }, typeof window !== 'undefined' ? window.__previewProps : {});

  let instance = null;

  function render(props) {
    if (instance && typeof instance.destroy === 'function') {
      try { instance.destroy(); } catch (_) {}
    }
    container.innerHTML = '';
    instance = renderForceGraph(container, {
      nodes: props.nodes || DEFAULT_NODES,
      links: props.links || DEFAULT_LINKS,
      width: Number(props.width) || 400,
      height: Number(props.height) || 300,
      onSelectNode: function(node) {
        if (typeof log === 'function') log('selectNode', node);
      },
    });
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function(newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
