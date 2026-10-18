const sampleFruits = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Cherry', 'Cranberry', 'Date', 'Elderberry', 'Fig', 'Grape'];

async function searchFruits(q) {
  const lower = q.toLowerCase();
  return sampleFruits.filter((f) => f.toLowerCase().includes(lower));
}

function Demo() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12.5px', color: '#94a3b8' }}>Search fruit:</label>
      <Typeahead
        fetchSuggestions={searchFruits}
        onSelect={log('onSelect')}
        delay={50}
      />
    </div>
  );
}

<Demo />
