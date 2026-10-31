const defaultFruitSuggestions = [
  'Apple',
  'Apricot',
  'Avocado',
  'Banana',
  'Blueberry',
  'Cherry',
  'Cranberry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
];

function Demo() {
  const {
    delay = 100,
    suggestions = defaultFruitSuggestions,
    onSelect,
  } = usePreviewProps({
    delay: 100,
    suggestions: defaultFruitSuggestions,
  });

  const fetchSuggestions = async (q) => {
    const list = Array.isArray(suggestions) ? suggestions : defaultFruitSuggestions;
    const lower = q.toLowerCase();
    return list.filter((f) => f.toLowerCase().includes(lower));
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12.5px', color: '#94a3b8' }}>Search fruit:</label>
      <Typeahead
        fetchSuggestions={fetchSuggestions}
        delay={delay !== undefined && delay !== null && delay !== '' ? Number(delay) : 300}
        onSelect={(item) => {
          if (onSelect) onSelect(item);
          log('onSelect', item);
        }}
      />
    </div>
  );
}

<Demo />
