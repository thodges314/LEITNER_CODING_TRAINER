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
  await db.exec(`CREATE TABLE product_sales (id INT PRIMARY KEY, product VARCHAR(50), sale_date DATE, amount INT);`);

  // Case 1: Pivots Q1 sales across products with zero-filled gaps
  await db.exec(`DELETE FROM product_sales; INSERT INTO product_sales VALUES (1, 'Widget', '2024-01-10', 100), (2, 'Widget', '2024-01-20', 150), (3, 'Widget', '2024-02-14', 200), (4, 'Gadget', '2024-02-05', 300), (5, 'Gadget', '2024-03-22', 400);`);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Pivots Q1 sales across products with zero-filled gaps',
    r1 !== null && $test.equal(r1, [
      { product: 'Gadget', jan_sales: 0, feb_sales: 300, mar_sales: 400 },
      { product: 'Widget', jan_sales: 250, feb_sales: 200, mar_sales: 0 }
    ]),
    r1
  );

  // Case 2: Handles single product with sales in all three months
  await db.exec(`DELETE FROM product_sales; INSERT INTO product_sales VALUES (1, 'Alpha', '2024-01-01', 50), (2, 'Alpha', '2024-02-01', 60), (3, 'Alpha', '2024-03-01', 70);`);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Handles single product with sales in all three months',
    r2 !== null && $test.equal(r2, [
      { product: 'Alpha', jan_sales: 50, feb_sales: 60, mar_sales: 70 }
    ]),
    r2
  );

  // Case 3: Returns empty array when product_sales table is empty
  await db.exec(`DELETE FROM product_sales;`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when product_sales table is empty',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Ignores sales dates outside Q1 2024
  await db.exec(`DELETE FROM product_sales; INSERT INTO product_sales VALUES (1, 'Beta', '2023-12-31', 500), (2, 'Beta', '2024-04-01', 900), (3, 'Beta', '2024-01-15', 80);`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Ignores sales dates outside Q1 2024',
    r4 !== null && $test.equal(r4, [
      { product: 'Beta', jan_sales: 80, feb_sales: 0, mar_sales: 0 }
    ]),
    r4
  );
})();
