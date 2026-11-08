interface NextImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}

function NextImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
}: NextImageProps): React.ReactElement {
  if (!fill && (!width || !height)) {
    throw new Error('Next.js Image requires either width and height or fill=true to prevent layout shift');
  }

  const computedClassName = fill
    ? ['object-cover absolute inset-0 w-full h-full', className].filter(Boolean).join(' ')
    : className;

  const imgProps: Record<string, unknown> = {
    src,
    alt,
    decoding: 'async',
    loading: priority ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : 'auto',
    className: computedClassName || undefined,
  };

  if (!fill) {
    imgProps.width = width;
    imgProps.height = height;
  }

  return (
    <img
      data-testid="next-image"
      {...imgProps}
    />
  );
}
