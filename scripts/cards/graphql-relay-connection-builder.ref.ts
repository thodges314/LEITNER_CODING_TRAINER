interface Edge<T> {
  node: T;
  cursor: string;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

interface ConnectionArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

function encodeCursor(index: number): string {
  return btoa(String(index));
}

function decodeCursor(cursor: string): number {
  return parseInt(atob(cursor), 10);
}

function buildRelayConnection<T>(
  items: T[] = [],
  args: ConnectionArgs = {}
): Connection<T> {
  const safeItems = Array.isArray(items) ? items : [];
  const totalCount = safeItems.length;
  let edges: Edge<T>[] = safeItems.map((node, index) => ({
    node,
    cursor: encodeCursor(index),
  }));

  const { first, after, last, before } = args || {};

  let afterIndex: number | undefined;
  if (typeof after === 'string' && after.length > 0) {
    afterIndex = decodeCursor(after);
    if (!isNaN(afterIndex)) {
      edges = edges.filter((e) => decodeCursor(e.cursor) > afterIndex!);
    }
  }

  let beforeIndex: number | undefined;
  if (typeof before === 'string' && before.length > 0) {
    beforeIndex = decodeCursor(before);
    if (!isNaN(beforeIndex)) {
      edges = edges.filter((e) => decodeCursor(e.cursor) < beforeIndex!);
    }
  }

  let hasPreviousPage = false;
  let hasNextPage = false;

  if (afterIndex !== undefined && !isNaN(afterIndex) && afterIndex >= 0) {
    hasPreviousPage = true;
  }
  if (beforeIndex !== undefined && !isNaN(beforeIndex) && beforeIndex < totalCount) {
    hasNextPage = true;
  }

  if (first !== undefined) {
    if (typeof first === 'number' && first < 0) {
      throw new Error('first must be non-negative');
    }
    if (edges.length > first) {
      hasNextPage = true;
      edges = edges.slice(0, first);
    }
  }

  if (last !== undefined) {
    if (typeof last === 'number' && last < 0) {
      throw new Error('last must be non-negative');
    }
    if (edges.length > last) {
      hasPreviousPage = true;
      edges = edges.slice(edges.length - last);
    }
  }

  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    },
    totalCount,
  };
}
