function ButtonPreview() {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    label = 'Save Changes',
  } = usePreviewProps({
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    label: 'Save Changes',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px', padding: '24px' }}>
      <Button
        key={`${variant}-${size}-${loading}-${disabled}`}
        variant={variant}
        size={size}
        loading={Boolean(loading)}
        disabled={Boolean(disabled)}
        onClick={(e) => {
          if (typeof log === 'function') log('onClick', { variant, size, label });
        }}
      >
        {label}
      </Button>
    </div>
  );
}

<ButtonPreview />
