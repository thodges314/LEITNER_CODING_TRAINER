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
  await db.exec(`
    CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(50), city VARCHAR(50));
    CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, amount INT);
  `);

  // Case 1: Joins orders with customers and aliases columns ordered by order_id ASC
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'Alice', 'New York'), (2, 'Bob', 'Chicago'), (3, 'Charlie', 'Austin');
    INSERT INTO orders VALUES (101, 1, 150), (102, 3, 200), (103, 1, 75);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Joins orders with customers and aliases columns ordered by order_id ASC',
    r1 !== null && $test.equal(r1, [
      { order_id: 101, customer_name: 'Alice', amount: 150 },
      { order_id: 102, customer_name: 'Charlie', amount: 200 },
      { order_id: 103, customer_name: 'Alice', amount: 75 }
    ]),
    r1
  );

  // Case 2: Excludes customers who have placed zero orders
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'Diana', 'Seattle'), (2, 'Evan', 'Boston');
    INSERT INTO orders VALUES (50, 1, 320);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Excludes customers who have placed zero orders',
    r2 !== null && $test.equal(r2, [
      { order_id: 50, customer_name: 'Diana', amount: 320 }
    ]),
    r2
  );

  // Case 3: Excludes orders referencing non-matching customer_ids
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'Fiona', 'Denver');
    INSERT INTO orders VALUES (90, 999, 500);
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Excludes orders referencing non-matching customer_ids',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Returns empty array when orders table is empty
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'George', 'Miami');
  `);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when orders table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
