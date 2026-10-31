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
    CREATE TABLE Customers (id INT PRIMARY KEY, name TEXT, email TEXT);
    CREATE TABLE Orders (id INT PRIMARY KEY, customer_id INT, amount INT);
  `);

  // Case 1: Multiple customers, only those with >= 2 orders returned
  await db.exec(`
    INSERT INTO Customers VALUES
      (1, 'Alice', 'alice@example.com'),
      (2, 'Bob', 'bob@example.com'),
      (3, 'Carol', 'carol@example.com');
    INSERT INTO Orders VALUES
      (101, 1, 50),
      (102, 1, 70),
      (103, 2, 200),
      (104, 3, 30),
      (105, 3, 40);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check('Returns customers with >= 2 orders sorted by total spent', r1 !== null && $test.equal(r1, [
    { email: 'alice@example.com', order_count: 2, total_spent: 120 },
    { email: 'carol@example.com', order_count: 2, total_spent: 70 },
  ]), r1);

  // Case 2: No customers meet threshold
  await db.exec(`
    DELETE FROM Orders;
    INSERT INTO Orders VALUES (201, 1, 100), (202, 2, 100), (203, 3, 100);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check('Returns empty when no customer has at least 2 orders', r2 !== null && $test.equal(r2, []), r2);

  // Case 3: Empty orders
  await db.exec(`DELETE FROM Orders;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns empty when no orders exist', r3 !== null && $test.equal(r3, []), r3);

  // Case 4: Breaks ties in total spent by customer email ascending
  await db.exec(`
    DELETE FROM Orders;
    DELETE FROM Customers;
    INSERT INTO Customers VALUES (1, 'Zoe', 'zoe@example.com'), (2, 'Aaron', 'aaron@example.com');
    INSERT INTO Orders VALUES (1, 1, 50), (2, 1, 50), (3, 2, 40), (4, 2, 60);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check('Breaks ties in total spent by customer email ascending', r4 !== null && $test.equal(r4, [
    { email: 'aaron@example.com', order_count: 2, total_spent: 100 },
    { email: 'zoe@example.com', order_count: 2, total_spent: 100 },
  ]), r4);
})();
