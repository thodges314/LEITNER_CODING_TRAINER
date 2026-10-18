function toggleLike(post) {
  return { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) };
}

function applyOptimistic(items, id, patch) {
  return items.map((item) => (item.id === id ? { ...item, ...patch, pending: true } : item));
}

function confirmOptimistic(items, id, serverItem) {
  return items.map((item) => (item.id === id ? { ...serverItem, pending: false } : item));
}

function rollbackOptimistic(items, id, original) {
  return items.map((item) => (item.id === id ? original : item));
}
