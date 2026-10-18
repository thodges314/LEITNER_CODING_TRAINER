function Demo() {
  const sampleItems = ['Alpha', 'Beta', 'Gamma', 'Delta'];
  return (
    <div style={{ padding: '16px' }}>
      <Parent items={sampleItems} onListRender={log('onListRender')} />
    </div>
  );
}

<Demo />
