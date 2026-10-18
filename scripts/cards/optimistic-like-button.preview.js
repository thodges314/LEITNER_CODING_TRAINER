async function fakeToggle(nextLiked) {
  log('onToggle')(nextLiked);
  await new Promise((r) => setTimeout(r, 200));
}

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <LikeButton initialLiked={false} initialCount={42} onToggle={fakeToggle} />
    </div>
  );
}

<Demo />
