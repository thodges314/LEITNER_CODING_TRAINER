const sampleMenuItems = [
  { id: 'edit', label: 'Edit Profile' },
  { id: 'duplicate', label: 'Duplicate Entry' },
  { id: 'archive', label: 'Archive Record', disabled: true },
  { id: 'delete', label: 'Delete Forever' },
];

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <DropdownMenu label="Options ▾" items={sampleMenuItems} onSelect={log('onSelect')} />
    </div>
  );
}

<Demo />
