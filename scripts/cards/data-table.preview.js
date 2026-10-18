const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'score', label: 'Score' },
];

const tableRows = [
  { name: 'Alice', role: 'Engineer', score: 95 },
  { name: 'Bob', role: 'Designer', score: 88 },
  { name: 'Charlie', role: 'Manager', score: 92 },
  { name: 'Diana', role: 'DevOps', score: 97 },
  { name: 'Evan', role: 'QA', score: 85 },
  { name: 'Fiona', role: 'Engineer', score: 91 },
];

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <DataTable rows={tableRows} columns={tableColumns} pageSize={3} />
    </div>
  );
}

<Demo />
