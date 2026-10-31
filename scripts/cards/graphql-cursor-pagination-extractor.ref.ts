interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

interface ParsedPagination {
  isForward: boolean;
  limit: number;
  cursor?: string;
}

function parsePaginationArgs(
  args: PaginationArgs = {},
  options: PaginationOptions = {}
): ParsedPagination {
  const { first, after, last, before } = args || {};
  const defaultLimit = typeof options.defaultLimit === 'number' ? options.defaultLimit : 20;
  const maxLimit = typeof options.maxLimit === 'number' ? options.maxLimit : 50;

  if (first !== undefined && last !== undefined) {
    throw new Error('Cannot combine first and last');
  }
  if (first !== undefined && before !== undefined) {
    throw new Error('Cannot combine first and before');
  }
  if (last !== undefined && after !== undefined) {
    throw new Error('Cannot combine last and after');
  }
  if (after !== undefined && before !== undefined) {
    throw new Error('Cannot combine after and before');
  }

  if (typeof first === 'number' && first < 0) {
    throw new Error('first must be non-negative');
  }
  if (typeof last === 'number' && last < 0) {
    throw new Error('last must be non-negative');
  }

  let isForward = true;
  let limit = defaultLimit;
  let cursor: string | undefined;

  if (first !== undefined) {
    isForward = true;
    limit = Math.min(first, maxLimit);
    cursor = after;
  } else if (last !== undefined) {
    isForward = false;
    limit = Math.min(last, maxLimit);
    cursor = before;
  } else if (before !== undefined) {
    isForward = false;
    limit = defaultLimit;
    cursor = before;
  } else if (after !== undefined) {
    isForward = true;
    limit = defaultLimit;
    cursor = after;
  }

  const result: ParsedPagination = { isForward, limit };
  if (cursor !== undefined && cursor !== '') {
    result.cursor = cursor;
  }
  return result;
}
