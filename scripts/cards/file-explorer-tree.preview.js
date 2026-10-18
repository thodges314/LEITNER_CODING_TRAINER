const sampleTreeNodes = [
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
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>File explorer tree:</div>
      <FileTree nodes={sampleTreeNodes} onSelect={log('onSelect')} />
    </div>
  );
}

<Demo />
