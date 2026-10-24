type SortDirection = 'none' | 'ascending' | 'descending';

interface Column<T> {
  key: keyof T & string;
  label: string;
}

interface SortState<T> {
  key: (keyof T & string) | null;
  dir: SortDirection;
}

interface DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
}

function DataTable<T extends Record<string, unknown>>({ rows, columns, pageSize = 5 }: DataTableProps<T>): JSX.Element {
  const [sort, setSort] = useState<SortState<T>>({ key: null, dir: 'none' });
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const visible = useMemo<T[]>(() => {
    const q = filter.trim().toLowerCase();
    let out = q ? rows.filter((row: T) => columns.some((c) => String(row[c.key]).toLowerCase().includes(q))) : rows;
    if (sort.dir !== 'none' && sort.key !== null) {
      const factor = sort.dir === 'ascending' ? 1 : -1;
      const sortKey = sort.key;
      out = [...out].sort((a: T, b: T) => {
        const x = a[sortKey];
        const y = b[sortKey];
        const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return cmp * factor;
      });
    }
    return out;
  }, [rows, columns, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = visible.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: keyof T & string): void =>
    setSort((s: SortState<T>) => {
      if (s.key !== key) return { key, dir: 'ascending' };
      const dir: SortDirection = s.dir === 'none' ? 'ascending' : s.dir === 'ascending' ? 'descending' : 'none';
      return { key, dir };
    });

  return (
    <div>
      <input
        aria-label="Filter"
        value={filter}
        onChange={(e: unknown) => {
          setFilter((e as { target: { value: string } }).target.value);
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
            pageRows.map((row: T, i: number) => (
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
