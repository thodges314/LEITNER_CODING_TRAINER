function parsePaginationArgs(
  args: PaginationArgs = {},
  options: PaginationOptions = {}
): ParsedPagination {
  const { first, after, last, before } = args || {};
  const { defaultLimit = 20, maxLimit = 50 } = options;

  if (first !== undefined && last !== undefined) throw new Error('Cannot combine first and last');
  if (first !== undefined && before !== undefined) throw new Error('Cannot combine first and before');
  if (last !== undefined && after !== undefined) throw new Error('Cannot combine last and after');
  if (after !== undefined && before !== undefined) throw new Error('Cannot combine after and before');

  if (first !== undefined && first < 0) throw new Error('first must be non-negative');
  if (last !== undefined && last < 0) throw new Error('last must be non-negative');

  const isForward = last === undefined && before === undefined;
  const requested = isForward ? (first ?? defaultLimit) : (last ?? defaultLimit);
  const limit = Math.min(requested, maxLimit);
  const cursor = isForward ? after : before;

  return { isForward, limit, ...(cursor ? { cursor } : {}) };
}

