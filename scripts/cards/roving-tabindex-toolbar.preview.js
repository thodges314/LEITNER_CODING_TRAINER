const defaultToolbarItems = [
  { id: 'cut', label: 'Cut' },
  { id: 'copy', label: 'Copy' },
  { id: 'paste', label: 'Paste' },
  { id: 'delete', label: 'Delete' },
];

function Demo() {
  const {
    label = 'Editor Actions',
    items = defaultToolbarItems,
  } = usePreviewProps({
    label: 'Editor Actions',
    items: defaultToolbarItems,
  });

  const parsedItems = Array.isArray(items) && items.length > 0 ? items : defaultToolbarItems;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>
        Navigate buttons using Left/Right arrows, Home, and End keys.
      </p>
      <Toolbar
        key={JSON.stringify(parsedItems)}
        label={label || 'Editor Actions'}
        items={parsedItems}
      />
    </div>
  );
}

<Demo />
