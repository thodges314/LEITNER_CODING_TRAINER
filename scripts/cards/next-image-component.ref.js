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
    return (
      <div className="relative aspect-video">
        <Image
          src={src}
          alt={alt}
          fill
          priority={Boolean(priority)}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="image-wrapper">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={Boolean(priority)}
      />
    </div>
  );
}
