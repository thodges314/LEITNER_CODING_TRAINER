function Demo() {
  const { label = 'Clicks' } = usePreviewProps({
    label: 'Clicks',
  });

  return (
    <div style={{ padding: '16px' }}>
      <RenderCounter label={label} />
    </div>
  );
}

<Demo />

