function Demo() {
  const {
    label = 'Username:',
    placeholder = 'Focuses automatically on mount',
  } = usePreviewProps({
    label: 'Username:',
    placeholder: 'Focuses automatically on mount',
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <FocusInput
        key={`${label}-${placeholder}`}
        label={label || 'Username:'}
        placeholder={placeholder || 'Focuses automatically on mount'}
      />
    </div>
  );
}

<Demo />
