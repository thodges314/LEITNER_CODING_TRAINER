<div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>
    Navigate buttons using Left/Right arrows, Home, and End keys.
  </p>
  <Toolbar
    label="Editor Actions"
    items={[
      { id: 'cut', label: 'Cut' },
      { id: 'copy', label: 'Copy' },
      { id: 'paste', label: 'Paste' },
      { id: 'delete', label: 'Delete' },
    ]}
  />
</div>
