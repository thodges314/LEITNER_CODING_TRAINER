const defaultLanguages = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Swift', 'Kotlin', 'C++'];

function Demo() {
  const { items = defaultLanguages } = usePreviewProps({
    items: defaultLanguages,
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <FilterList items={Array.isArray(items) ? items : []} />
    </div>
  );
}

<Demo />
