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
  await db.exec(`CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), manager_id INT);`);

  // Case 1: Standard multi-level hierarchy
  await db.exec(`
    DELETE FROM Employees;
    INSERT INTO Employees VALUES
      (1, 'Satya', NULL),
      (2, 'Kevin', 1),
      (3, 'Amy', 1),
      (4, 'Phil', 2);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Traverses multi-level organization reporting hierarchy with correct depths and root leaders',
    r1 !== null && $test.equal(r1, [
      { id: 1, name: 'Satya', depth: 0, root_leader: 'Satya' },
      { id: 3, name: 'Amy', depth: 1, root_leader: 'Satya' },
      { id: 2, name: 'Kevin', depth: 1, root_leader: 'Satya' },
      { id: 4, name: 'Phil', depth: 2, root_leader: 'Satya' },
    ]),
    r1
  );

  // Case 2: Disjoint trees (two CEOs with separate reporting chains)
  await db.exec(`
    DELETE FROM Employees;
    INSERT INTO Employees VALUES
      (10, 'Alice', NULL),
      (11, 'Bob', 10),
      (20, 'Carol', NULL),
      (21, 'Dan', 20),
      (22, 'Eve', 21);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Handles multiple disjoint trees with separate root leaders',
    r2 !== null && $test.equal(r2, [
      { id: 10, name: 'Alice', depth: 0, root_leader: 'Alice' },
      { id: 20, name: 'Carol', depth: 0, root_leader: 'Carol' },
      { id: 11, name: 'Bob', depth: 1, root_leader: 'Alice' },
      { id: 21, name: 'Dan', depth: 1, root_leader: 'Carol' },
      { id: 22, name: 'Eve', depth: 2, root_leader: 'Carol' },
    ]),
    r2
  );

  // Case 3: Single isolated executive without reports
  await db.exec(`DELETE FROM Employees; INSERT INTO Employees VALUES (1, 'Solo', NULL);`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns depth 0 for an isolated executive without reports',
    r3 !== null && $test.equal(r3, [{ id: 1, name: 'Solo', depth: 0, root_leader: 'Solo' }]),
    r3
  );

  // Case 4: Empty table
  await db.exec(`DELETE FROM Employees;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty list when employees table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
