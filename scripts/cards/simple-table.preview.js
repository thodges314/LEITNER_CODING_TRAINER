const tableColumns = [
  { key: 'framework', label: 'Framework' },
  { key: 'language', label: 'Language' },
  { key: 'stars', label: 'GitHub Stars' },
];

const tableRows = [
  { framework: 'React', language: 'JavaScript / TypeScript', stars: '220k' },
  { framework: 'Vue', language: 'TypeScript', stars: '205k' },
  { framework: 'Svelte', language: 'TypeScript', stars: '75k' },
];

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <SimpleTable columns={tableColumns} rows={tableRows} />
    </div>
  );
}

<Demo />
