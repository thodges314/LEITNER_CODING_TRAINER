function DataTable({ rows, columns, pageSize = 5 }) {
  const [sort, setSort] = useState({ key: null, dir: 'none' });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let out = q ? rows.filter((row) => columns.some((c) => String(row[c.key]).toLowerCase().includes(q))) : rows;
    if (sort.dir !== 'none') {
      const factor = sort.dir === 'ascending' ? 1 : -1;
      out = [...out].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return cmp * factor;
      });
    }
    return out;
  }, [rows, columns, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = visible.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'ascending' };
      const dir = s.dir === 'none' ? 'ascending' : s.dir === 'ascending' ? 'descending' : 'none';
      return { key, dir };
    });

  return (
    <div>
      <input
        aria-label="Filter"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}
      />
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} aria-sort={sort.key === c.key ? sort.dir : 'none'}>
                <button onClick={() => toggleSort(c.key)}>{c.label}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No results</td>
            </tr>
          ) : (
            pageRows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key}>{String(row[c.key])}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button disabled={current <= 1} onClick={() => setPage(current - 1)}>
        Previous
      </button>
      <span>
        Page {current} of {totalPages}
      </span>
      <button disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
        Next
      </button>
    </div>
  );
}
