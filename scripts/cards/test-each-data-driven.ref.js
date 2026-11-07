function createTestEach(registerTest) {
  function formatTitle(title, row, isObject) {
    if (isObject) {
      return title.replace(/\$([a-zA-Z0-9_]+)/g, (_, key) => {
        const v = row[key];
        return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
      });
    }
    let index = 0;
    return title.replace(/%([sidfpj])/g, (match, spec) => {
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

  return function each(table) {
    return function test(titlePattern, testFn) {
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

