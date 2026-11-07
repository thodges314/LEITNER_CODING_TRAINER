function BadgePreview() {
  const {
    variant = 'success',
    size = 'md',
    dot = true,
    label = 'Operational',
  } = usePreviewProps({
    variant: 'success',
    size: 'md',
    dot: true,
    label: 'Operational',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '140px', padding: '24px' }}>
      <Badge
        key={`${variant}-${size}-${dot}`}
        variant={variant}
        size={size}
        dot={Boolean(dot)}
      >
        {label}
      </Badge>
    </div>
  );
}

<BadgePreview />

