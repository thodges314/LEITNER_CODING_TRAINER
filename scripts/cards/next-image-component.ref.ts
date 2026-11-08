interface HeroBannerProps {
  src: string;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

function HeroBanner({
  src,
  alt,
  priority = false,
  fill = false,
  width = 800,
  height = 400,
}: HeroBannerProps): React.ReactElement {
  if (fill) {
    return React.createElement(
      'div',
      { className: 'relative aspect-video' },
      React.createElement(Image, {
        src,
        alt,
        fill: true,
        priority: Boolean(priority),
        sizes: '(max-width: 768px) 100vw, 50vw',
      })
    );
  }

  return React.createElement(
    'div',
    { className: 'image-wrapper' },
    React.createElement(Image, {
      src,
      alt,
      width,
      height,
      priority: Boolean(priority),
    })
  );
}

