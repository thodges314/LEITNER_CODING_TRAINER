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
    CREATE TABLE products (
      id INT PRIMARY KEY,
      name VARCHAR(50),
      category VARCHAR(50),
      price INT,
      stock INT
    );
  `);

  // Case 1: Filters by category and stock, sorts by price ASC then name ASC, and limits to 3
  await db.exec(`
    DELETE FROM products;
    INSERT INTO products VALUES
      (1, 'Laptop', 'Electronics', 999, 10),
      (2, 'Keyboard', 'Electronics', 50, 25),
      (3, 'Mouse', 'Electronics', 50, 15),
      (4, 'Desk Lamp', 'Home', 40, 5),
      (5, 'Headphones', 'Electronics', 120, 0),
      (6, 'Webcam', 'Electronics', 75, 8);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Filters by category and stock, sorts by price ASC then name ASC, and limits to 3',
    r1 !== null && $test.equal(r1, [
      { id: 2, name: 'Keyboard', price: 50, stock: 25 },
      { id: 3, name: 'Mouse', price: 50, stock: 15 },
      { id: 6, name: 'Webcam', price: 75, stock: 8 }
    ]),
    r1
  );

  // Case 2: Excludes out-of-stock electronics even if price is lowest
  await db.exec(`
    DELETE FROM products;
    INSERT INTO products VALUES
      (1, 'USB Cable', 'Electronics', 10, 0),
      (2, 'Flash Drive', 'Electronics', 15, 4);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Excludes out-of-stock electronics even if price is lowest',
    r2 !== null && $test.equal(r2, [
      { id: 2, name: 'Flash Drive', price: 15, stock: 4 }
    ]),
    r2
  );

  // Case 3: Returns empty array when no matching in-stock electronics exist
  await db.exec(`
    DELETE FROM products;
    INSERT INTO products VALUES
      (1, 'Sofa', 'Home', 500, 2),
      (2, 'Chair', 'Home', 150, 5);
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when no matching in-stock electronics exist',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Returns empty array on completely empty products table
  await db.exec(`DELETE FROM products;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array on completely empty products table',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
