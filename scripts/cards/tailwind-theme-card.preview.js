function Demo() {
  const {
    title = 'Theme-Adaptive Card',
    description = 'Flip the theme switch in the top bar to test Light and Dark mode.',
    badge = 'Adaptive',
  } = usePreviewProps({
    title: 'Theme-Adaptive Card',
    description: 'Flip the theme switch in the top bar to test Light and Dark mode.',
    badge: 'Adaptive',
  });

  return (
    <div style={{ padding: '16px', maxWidth: '420px' }}>
      <ThemeCard title={title} description={description} badge={badge || undefined} />
    </div>
  );
}

<Demo />

