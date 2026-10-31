function Demo() {
  const {
    initialCount = 42,
    initialLiked = false,
    onToggle,
  } = usePreviewProps({
    initialCount: 42,
    initialLiked: false,
  });

  const parsedCount = Number(initialCount) || 0;
  const parsedLiked = Boolean(initialLiked);

  const handleToggle = async (nextLiked) => {
    if (onToggle) await onToggle(nextLiked);
    log('onToggle', nextLiked);
    await new Promise((r) => setTimeout(r, 200));
  };

  return (
    <div style={{ padding: '16px' }}>
      <LikeButton
        key={`${parsedCount}-${parsedLiked}`}
        initialLiked={parsedLiked}
        initialCount={parsedCount}
        onToggle={handleToggle}
      />
    </div>
  );
}

<Demo />
