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
  await db.exec(`CREATE TABLE Employee (id INT PRIMARY KEY, name TEXT, salary INT, department_id INT);`);

  // Case 1: Standard comparison
  await db.exec(`
    INSERT INTO Employee VALUES
      (1, 'Alice', 100, 1),
      (2, 'Bob', 70, 1),
      (3, 'Charlie', 120, 2),
      (4, 'David', 100, 2);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check('Returns employees strictly above department average', r1 !== null && $test.equal(r1, [
    { Employee: 'Alice', Salary: 100, DepartmentId: 1 },
    { Employee: 'Charlie', Salary: 120, DepartmentId: 2 },
  ]), r1);

  // Case 2: All employees have same salary (none above average)
  await db.exec(`DELETE FROM Employee; INSERT INTO Employee VALUES (1, 'Eve', 100, 1), (2, 'Frank', 100, 1);`);
  const r2 = await runSafe(db, userSql);
  $test.check('Returns empty when all salaries are equal to average', r2 !== null && $test.equal(r2, []), r2);

  // Case 3: Empty table
  await db.exec(`DELETE FROM Employee;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns empty when table has no records', r3 !== null && $test.equal(r3, []), r3);

  // Case 4: Solo employee matching average vs multi-employee department
  await db.exec(`
    DELETE FROM Employee;
    INSERT INTO Employee VALUES (1, 'Solo', 100, 1), (2, 'Low', 50, 2), (3, 'High', 150, 2);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check('Filters out solo department employees matching average and keeps above-average in multi-employee departments', r4 !== null && $test.equal(r4, [
    { Employee: 'High', Salary: 150, DepartmentId: 2 },
  ]), r4);
})();
