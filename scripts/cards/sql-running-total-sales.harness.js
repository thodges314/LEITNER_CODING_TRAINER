await (async () => {
  const userSql = typeof query === 'function' ? query() : (typeof query !== 'undefined' ? query : '');
  async function runSafe(db, sql) {
    try {
      return (await db.query(sql)).rows;
    } catch {
      return null;
    }
  }

  const db = new PGlite();
  await db.exec(`CREATE TABLE Orders (id INT PRIMARY KEY, order_date TEXT, amount INT);`);

  // Case 1: Multiple daily orders
  await db.exec(`
    INSERT INTO Orders VALUES
      (1, '2024-01-01', 100),
      (2, '2024-01-02', 150),
      (3, '2024-01-03', 200);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check('Computes cumulative running total', r1 !== null && $test.equal(r1, [
    { order_date: '2024-01-01', amount: 100, running_total: 100 },
    { order_date: '2024-01-02', amount: 150, running_total: 250 },
    { order_date: '2024-01-03', amount: 200, running_total: 450 },
  ]), r1);

  // Case 2: Same date multiple orders
  await db.exec(`
    DELETE FROM Orders;
    INSERT INTO Orders VALUES
      (1, '2024-02-01', 50),
      (2, '2024-02-01', 25),
      (3, '2024-02-02', 25);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check('Breaks ties on same date using id', r2 !== null && $test.equal(r2, [
    { order_date: '2024-02-01', amount: 50, running_total: 50 },
    { order_date: '2024-02-01', amount: 25, running_total: 75 },
    { order_date: '2024-02-02', amount: 25, running_total: 100 },
  ]), r2);

  // Case 3: Empty orders
  await db.exec(`DELETE FROM Orders;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns empty when no orders exist', r3 !== null && $test.equal(r3, []), r3);

  // Case 4: Single order
  await db.exec(`
    DELETE FROM Orders;
    INSERT INTO Orders VALUES (1, '2024-05-10', 42);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check('Computes running total correctly for a single order', r4 !== null && $test.equal(r4, [
    { order_date: '2024-05-10', amount: 42, running_total: 42 },
  ]), r4);
})();
