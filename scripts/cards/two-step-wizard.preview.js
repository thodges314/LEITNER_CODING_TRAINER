function Demo() {
  const { onSubmit } = usePreviewProps({});

  return (
    <div style={{ padding: '16px' }}>
      <TwoStepWizard
        onSubmit={(data) => {
          if (onSubmit) onSubmit(data);
          log('onSubmit', data);
        }}
      />
    </div>
  );
}

<Demo />

