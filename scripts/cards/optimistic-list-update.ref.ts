interface Post {
  id: string | number;
  liked: boolean;
  likes: number;
  [key: string]: unknown;
}

interface Item {
  id: string | number;
  [key: string]: unknown;
}

function toggleLike<T extends Post>(post: T): T {
  return { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) };
}

function applyOptimistic<T extends Item>(items: T[], id: string | number, patch: Record<string, unknown>): (T & { pending?: boolean })[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch, pending: true } : item));
}

function confirmOptimistic<T extends Item>(items: (T & { pending?: boolean })[], id: string | number, serverItem: Item): (T & { pending?: boolean })[] {
  return items.map((item) => (item.id === id ? ({ ...serverItem, pending: false } as T & { pending?: boolean }) : item));
}

function rollbackOptimistic<T extends Item>(items: (T & { pending?: boolean })[], id: string | number, original: Item): (T & { pending?: boolean })[] {
  return items.map((item) => (item.id === id ? (original as T) : item));
}
