function Demo() {
  const { onSubmit = log('onSubmit') } = usePreviewProps({
    onSubmit: log('onSubmit'),
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20, maxWidth: 400 }}>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#94a3b8' }}>
        Accessible error summary box moves focus when validation fails. Try submitting empty fields:
      </p>
      <SignupForm onSubmit={onSubmit} />
    </div>
  );
}

<Demo />
