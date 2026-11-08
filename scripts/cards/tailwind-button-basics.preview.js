function ButtonPreview() {
  const {
    variant = 'primary',
    disabled = false,
    label = 'Save Changes',
  } = usePreviewProps({
    variant: 'primary',
    disabled: false,
    label: 'Save Changes',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px', padding: '24px' }}>
      <Button
        key={`${variant}-${disabled}-${label}`}
        variant={variant}
        disabled={Boolean(disabled)}
        onClick={() => {
          if (typeof log === 'function') log('onClick', { variant, disabled, label });
        }}
      >
        {label}
      </Button>
    </div>
  );
}

<ButtonPreview />
