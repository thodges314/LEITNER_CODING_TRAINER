function Demo() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Controlled Search Form:</div>
      <SearchForm onSearch={log('onSearch')} />
    </div>
  );
}

<Demo />
