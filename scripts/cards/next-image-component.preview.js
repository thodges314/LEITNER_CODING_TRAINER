function Preview() {
  const props = usePreviewProps({
    src: 'https://www.leitnercoding.dev/Mountains.jpeg',
    alt: 'Sierra Ridge Lake Tahoe',
    fill: false,
    priority: true,
    width: 600,
    height: 340,
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[380px] flex items-center justify-center rounded-lg">
      <div className={props.fill ? 'w-full max-w-xl' : ''}>
        <HeroBanner
          key={`${props.fill}-${props.width}-${props.height}`}
          src={props.src}
          alt={props.alt}
          fill={props.fill}
          priority={props.priority}
          width={props.width}
          height={props.height}
        />
      </div>
    </div>
  );
}

<Preview />

