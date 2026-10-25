function Demo() {
  const { columns, rows } = usePreviewProps({
    columns: [
      { key: 'framework', label: 'Framework' },
      { key: 'language', label: 'Language' },
      { key: 'stars', label: 'GitHub Stars' },
    ],
    rows: [
      { framework: 'React', language: 'JavaScript / TypeScript', stars: '220k' },
      { framework: 'Vue', language: 'TypeScript', stars: '205k' },
      { framework: 'Svelte', language: 'TypeScript', stars: '75k' },
    ],
  });

  useEffect(() => {
    log('table')({ columnsCount: columns?.length, rowsCount: rows?.length });
  }, [columns, rows]);

  return (
    <div style={{ padding: '16px' }}>
      <SimpleTable columns={columns || []} rows={rows || []} />
    </div>
  );
}

<Demo />
