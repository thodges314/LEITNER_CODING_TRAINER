type SortableRecord = { id: string | number } & Record<string, unknown>;

function dedupeAndSort<T extends SortableRecord>(records: T[], sortBy: string | string[] = 'id'): T[] {
  const keys = Array.isArray(sortBy) ? sortBy : [sortBy];

  const byId = new Map<T['id'], T>();
  for (const r of records) byId.set(r.id, r); // latest wins

  const compare = (x: unknown, y: unknown): number => {
    if (x == null && y == null) return 0;
    if (x == null) return 1; // nulls last
    if (y == null) return -1;
    if (typeof x === 'string' && typeof y === 'string') return x.localeCompare(y);
    return (x as number) < (y as number) ? -1 : (x as number) > (y as number) ? 1 : 0;
  };

  // Array.prototype.sort is stable, so equal records keep their relative order.
  return [...byId.values()].sort((a, b) => {
    for (const key of keys) {
      const c = compare(a[key], b[key]);
      if (c !== 0) return c;
    }
    return 0;
  });
}
