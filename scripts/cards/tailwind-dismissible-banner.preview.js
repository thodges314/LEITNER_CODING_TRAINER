function Demo() {
  const { variant = 'success', title = 'Build Succeeded', message = 'Tailwind CSS classes compiled and rendered cleanly.' } = usePreviewProps({
    variant: 'success',
    title: 'Build Succeeded',
    message: 'Tailwind CSS classes compiled and rendered cleanly.',
  });

  return (
    <div style={{ padding: '20px', maxWidth: '440px' }}>
      <DismissibleBanner
        key={variant + title}
        variant={variant}
        title={title}
        message={message}
        onDismiss={() => log('dismiss', 'Banner was dismissed')}
      />
    </div>
  );
}

<Demo />
