function Pagination({ page, totalPages, onPageChange, siblings = 1 }) {
  const shown = new Set([1, totalPages]);
  for (let p = page - siblings; p <= page + siblings; p++) {
    if (p >= 1 && p <= totalPages) shown.add(p);
  }
  const sorted = [...shown].sort((a, b) => a - b);

  const items = [];
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous === 2) items.push(previous + 1); // one missing page: show it
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
