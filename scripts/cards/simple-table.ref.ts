interface Column<T> {
  key: keyof T & string;
  label: string;
}

interface SimpleTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
}

function SimpleTable<T extends Record<string, unknown>>({ columns, rows }: SimpleTableProps<T>): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>No rows</td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key] == null ? '' : String(row[column.key])}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
