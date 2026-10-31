const defaultMenuItems = [
  { id: 'edit', label: 'Edit Profile' },
  { id: 'duplicate', label: 'Duplicate Entry' },
  { id: 'archive', label: 'Archive Record', disabled: true },
  { id: 'delete', label: 'Delete Forever' },
];

function Demo() {
  const {
    label = 'Options ▾',
    items = defaultMenuItems,
    onSelect,
  } = usePreviewProps({
    label: 'Options ▾',
    items: defaultMenuItems,
  });

  return (
    <div style={{ padding: '16px' }}>
      <DropdownMenu
        label={label || 'Options ▾'}
        items={Array.isArray(items) ? items : defaultMenuItems}
        onSelect={(id) => {
          if (onSelect) onSelect(id);
          log('onSelect', id);
        }}
      />
    </div>
  );
}

<Demo />
