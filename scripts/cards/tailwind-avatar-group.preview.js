function AvatarGroupPreview() {
  const {
    max = 4,
    size = 'md',
  } = usePreviewProps({
    max: 4,
    size: 'md',
  });

  const team = [
    { name: 'Alex Rivera', status: 'online' },
    { name: 'Bethany Chen', status: 'busy' },
    { name: 'Carlos Mendez', status: 'online' },
    { name: 'Dana Scully', status: 'away' },
    { name: 'Evan Wright', status: 'offline' },
    { name: 'Fiona Gallagher' },
    { name: 'George Clark', status: 'online' },
  ];

  return (
    <div className="p-8 max-w-xl mx-auto flex items-center justify-center min-h-[140px]">
      <AvatarGroup
        key={`${max}-${size}`}
        avatars={team}
        max={Number(max) || 4}
        size={size}
      />
    </div>
  );
}

<AvatarGroupPreview />
