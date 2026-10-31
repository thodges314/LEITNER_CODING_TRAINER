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
    CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(50));
    CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, amount INT);
  `);

  // Case 1: Identifies customers with no orders in orders table
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'Joe'), (2, 'Henry'), (3, 'Sam'), (4, 'Max');
    INSERT INTO orders VALUES (1, 3, 150), (2, 1, 200);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Identifies customers with no orders in orders table',
    r1 !== null && $test.equal(r1, [
      { customer_name: 'Henry' },
      { customer_name: 'Max' }
    ]),
    r1
  );

  // Case 2: Returns empty array when all customers have placed at least one order
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (1, 'Alice'), (2, 'Bob');
    INSERT INTO orders VALUES (1, 1, 50), (2, 2, 75), (3, 1, 25);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when all customers have placed at least one order',
    r2 !== null && $test.equal(r2, []),
    r2
  );

  // Case 3: Returns all customers when orders table is completely empty
  await db.exec(`
    DELETE FROM orders; DELETE FROM customers;
    INSERT INTO customers VALUES (10, 'Zack'), (20, 'Yvonne');
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns all customers when orders table is completely empty',
    r3 !== null && $test.equal(r3, [
      { customer_name: 'Yvonne' },
      { customer_name: 'Zack' }
    ]),
    r3
  );

  // Case 4: Returns empty array when customers table is empty
  await db.exec(`DELETE FROM orders; DELETE FROM customers;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when customers table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
