type TestFn = (...args: any[]) => void | Promise<void>;
type RegisterTestFn = (title: string, fn: () => void | Promise<void>) => void;
type EachRunner = (titlePattern: string, testFn: TestFn) => void;

function createTestEach(registerTest: RegisterTestFn): (table: any[]) => EachRunner {
  function formatTitle(title: string, row: any, isObject: boolean): string {
    if (isObject) {
      return title.replace(/\$([a-zA-Z0-9_]+)/g, (_: string, key: string) => {
        const v = row[key];
        return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
      });
    }
    let index = 0;
    return title.replace(/%([sidfpj])/g, (match: string, spec: string) => {
      if (index >= row.length) return match;
      const v = row[index++];
      switch (spec) {
        case 's': return String(v);
        case 'i':
        case 'd': return String(parseInt(v, 10));
        case 'f': return String(parseFloat(v));
        case 'p':
        case 'j': return JSON.stringify(v);
        default: return String(v);
      }
    });
  }

  return function each(table: any[]): EachRunner {
    return function test(titlePattern: string, testFn: TestFn): void {
      if (!Array.isArray(table) || table.length === 0) return;
      for (const row of table) {
        const isObj = typeof row === 'object' && row !== null && !Array.isArray(row);
        const args = isObj ? [row] : (Array.isArray(row) ? row : [row]);
        const formattedTitle = formatTitle(titlePattern, isObj ? row : args, isObj);
        registerTest(formattedTitle, () => testFn(...args));
      }
    };
  };
}

