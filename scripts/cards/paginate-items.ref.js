function paginate(items, page, pageSize) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('pageSize must be a positive integer');
  }
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const current = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    totalItems,
    totalPages,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}
