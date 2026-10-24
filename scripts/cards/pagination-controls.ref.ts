interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
}

function Pagination({ page, totalPages, onPageChange, siblings = 1 }: PaginationProps): JSX.Element {
  const shown = new Set<number>([1, totalPages]);
  for (let p = page - siblings; p <= page + siblings; p++) {
    if (p >= 1 && p <= totalPages) shown.add(p);
  }
  const sorted = [...shown].sort((a: number, b: number) => a - b);

  const items: (number | string)[] = [];
  sorted.forEach((p: number, i: number) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && p - previous > 2) items.push('ellipsis-' + p);
    items.push(p);
  });

  return (
    <nav aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <ul>
        {items.map((item) =>
          typeof item === 'string' ? (
            <li key={item}>
              <span>…</span>
            </li>
          ) : (
            <li key={item}>
              <button aria-current={item === page ? 'page' : undefined} onClick={() => onPageChange(item)}>
                {item}
              </button>
            </li>
          )
        )}
      </ul>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
