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
    CREATE TABLE Department (id INT PRIMARY KEY, name TEXT);
    CREATE TABLE Employee (id INT PRIMARY KEY, name TEXT, salary INT, department_id INT);
  `);

  // Case 1: Standard department rankings with tie
  await db.exec(`
    INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
    INSERT INTO Employee VALUES
      (1, 'Joe', 70000, 1),
      (2, 'Jim', 90000, 1),
      (3, 'Henry', 80000, 2),
      (4, 'Sam', 60000, 2),
      (5, 'Max', 90000, 1);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check('Returns department top earners preserving ties', r1 !== null && $test.equal(r1, [
    { Department: 'IT', Employee: 'Jim', Salary: 90000 },
    { Department: 'IT', Employee: 'Max', Salary: 90000 },
    { Department: 'Sales', Employee: 'Henry', Salary: 80000 },
  ]), r1);

  // Case 2: Single department
  await db.exec(`
    DELETE FROM Employee;
    DELETE FROM Department;
    INSERT INTO Department VALUES (10, 'Engineering');
    INSERT INTO Employee VALUES (1, 'Alice', 120000, 10), (2, 'Bob', 110000, 10);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check('Works with single department', r2 !== null && $test.equal(r2, [
    { Department: 'Engineering', Employee: 'Alice', Salary: 120000 },
  ]), r2);

  // Case 3: Empty departments
  await db.exec(`DELETE FROM Employee; DELETE FROM Department;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns empty list when tables are empty', r3 !== null && $test.equal(r3, []), r3);

  // Case 4: Distinct non-tied departments
  await db.exec(`
    DELETE FROM Employee;
    DELETE FROM Department;
    INSERT INTO Department VALUES (1, 'Finance'), (2, 'HR');
    INSERT INTO Employee VALUES (1, 'Amy', 50000, 2), (2, 'Bob', 75000, 1);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check('Returns highest earner across distinct non-tied departments', r4 !== null && $test.equal(r4, [
    { Department: 'Finance', Employee: 'Bob', Salary: 75000 },
    { Department: 'HR', Employee: 'Amy', Salary: 50000 },
  ]), r4);
})();
