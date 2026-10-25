function Demo() {
  const { columns, rows, pageSize } = usePreviewProps({
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'score', label: 'Score' },
    ],
    rows: [
      { name: 'Alice', role: 'Engineer', score: 95 },
      { name: 'Bob', role: 'Designer', score: 88 },
      { name: 'Charlie', role: 'Manager', score: 92 },
      { name: 'Diana', role: 'DevOps', score: 97 },
      { name: 'Evan', role: 'QA', score: 85 },
      { name: 'Fiona', role: 'Engineer', score: 91 },
    ],
    pageSize: 3,
  });

  useEffect(() => {
    log('datatable')({ columnsCount: columns?.length, rowsCount: rows?.length, pageSize });
  }, [columns, rows, pageSize]);

  return (
    <div style={{ padding: '16px' }}>
      <DataTable rows={rows || []} columns={columns || []} pageSize={pageSize ?? 3} />
    </div>
  );
}

<Demo />
