const defaultTreeNodes = [
  {
    name: 'src',
    children: [
      { name: 'App.jsx' },
      { name: 'index.css' },
      {
        name: 'components',
        children: [{ name: 'Button.jsx' }, { name: 'Header.jsx' }],
      },
    ],
  },
  { name: 'package.json' },
  { name: 'README.md' },
];

function Demo() {
  const {
    nodes = defaultTreeNodes,
    onSelect,
  } = usePreviewProps({
    nodes: defaultTreeNodes,
  });

  const parsedNodes = Array.isArray(nodes) && nodes.length > 0 ? nodes : defaultTreeNodes;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>File explorer tree:</div>
      <FileTree
        key={JSON.stringify(parsedNodes)}
        nodes={parsedNodes}
        onSelect={(path) => {
          if (onSelect) onSelect(path);
          log('onSelect', path);
        }}
      />
    </div>
  );
}

<Demo />
