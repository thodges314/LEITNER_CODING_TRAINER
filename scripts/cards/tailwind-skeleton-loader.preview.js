function SkeletonPreview() {
  const {
    variant = 'card',
    lines = 3,
  } = usePreviewProps({
    variant: 'card',
    lines: 3,
  });

  return (
    <div className="p-8 max-w-md mx-auto flex flex-col items-center justify-center min-h-[260px] w-full">
      <div className="w-full">
        <Skeleton
          key={`${variant}-${lines}`}
          variant={variant}
          lines={Number(lines) || 1}
        />
      </div>
    </div>
  );
}

<SkeletonPreview />

