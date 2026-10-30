function Demo() {
  const [lastQuery, setLastQuery] = useState('');
  const { onSearch } = usePreviewProps({
    onSearch: (q) => {
      setLastQuery(q);
      if (typeof log === 'function') log('onSearch', q);
    },
  });

  const handleSearch = (q) => {
    setLastQuery(q);
    if (typeof onSearch === 'function') {
      onSearch(q);
    } else if (typeof log === 'function') {
      log('onSearch', q);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Controlled Search Form:</div>
      <SearchForm onSearch={handleSearch} />
      {lastQuery && (
        <div style={{ fontSize: '13px', color: '#38bdf8' }}>
          Submitted query: <strong>"{lastQuery}"</strong>
        </div>
      )}
    </div>
  );
}

<Demo />
