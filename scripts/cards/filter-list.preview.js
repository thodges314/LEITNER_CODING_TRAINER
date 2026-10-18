const sampleLanguages = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Swift', 'Kotlin', 'C++'];

function Demo() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <FilterList items={sampleLanguages} />
    </div>
  );
}

<Demo />
