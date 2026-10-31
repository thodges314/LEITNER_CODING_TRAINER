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
  await db.exec(`CREATE TABLE Employee (id INT PRIMARY KEY, salary INT);`);

  // Case 1: Standard 3 distinct salaries
  await db.exec(`DELETE FROM Employee; INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);`);
  const r1 = await runSafe(db, userSql);
  $test.check('Returns second highest salary when multiple distinct salaries exist', r1 !== null && $test.equal(r1, [{ SecondHighestSalary: 200 }]), r1);

  // Case 2: Only 1 employee
  await db.exec(`DELETE FROM Employee; INSERT INTO Employee VALUES (1, 100);`);
  const r2 = await runSafe(db, userSql);
  $test.check('Returns null when only 1 record exists', r2 !== null && $test.equal(r2, [{ SecondHighestSalary: null }]), r2);

  // Case 3: Empty table
  await db.exec(`DELETE FROM Employee;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns null when table is empty', r3 !== null && $test.equal(r3, [{ SecondHighestSalary: null }]), r3);

  // Case 4: Duplicate top salaries
  await db.exec(`INSERT INTO Employee VALUES (1, 500), (2, 500), (3, 400), (4, 300);`);
  const r4 = await runSafe(db, userSql);
  $test.check('Handles duplicate highest salaries correctly', r4 !== null && $test.equal(r4, [{ SecondHighestSalary: 400 }]), r4);
})();
