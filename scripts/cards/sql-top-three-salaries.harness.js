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
    CREATE TABLE Department (id INT PRIMARY KEY, name VARCHAR(50));
    CREATE TABLE Employee (id INT PRIMARY KEY, name VARCHAR(50), salary INT, departmentId INT);
  `);

  // Case 1: Standard case with ties in IT and fewer in Sales
  await db.exec(`
    DELETE FROM Employee; DELETE FROM Department;
    INSERT INTO Department VALUES (1, 'IT'), (2, 'Sales');
    INSERT INTO Employee VALUES
      (1, 'Joe', 85000, 1),
      (2, 'Henry', 80000, 2),
      (3, 'Sam', 60000, 2),
      (4, 'Max', 90000, 1),
      (5, 'Janet', 69000, 1),
      (6, 'Randy', 85000, 1),
      (7, 'Will', 70000, 1);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Selects top three unique salaries preserving ties across departments',
    r1 !== null && $test.equal(r1, [
      { Department: 'IT', Employee: 'Max', Salary: 90000 },
      { Department: 'IT', Employee: 'Joe', Salary: 85000 },
      { Department: 'IT', Employee: 'Randy', Salary: 85000 },
      { Department: 'IT', Employee: 'Will', Salary: 70000 },
      { Department: 'Sales', Employee: 'Henry', Salary: 80000 },
      { Department: 'Sales', Employee: 'Sam', Salary: 60000 },
    ]),
    r1
  );

  // Case 2: Department with fewer than 3 employees
  await db.exec(`
    DELETE FROM Employee; DELETE FROM Department;
    INSERT INTO Department VALUES (1, 'Engineering');
    INSERT INTO Employee VALUES (10, 'Alice', 120000, 1), (11, 'Bob', 110000, 1);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Includes all employees when department has fewer than three distinct salaries',
    r2 !== null && $test.equal(r2, [
      { Department: 'Engineering', Employee: 'Alice', Salary: 120000 },
      { Department: 'Engineering', Employee: 'Bob', Salary: 110000 },
    ]),
    r2
  );

  // Case 3: Empty tables
  await db.exec(`DELETE FROM Employee; DELETE FROM Department;`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty list when employees table is empty',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Multiple salaries in one department where rank > 3 must be filtered out
  await db.exec(`
    DELETE FROM Employee; DELETE FROM Department;
    INSERT INTO Department VALUES (1, 'R&D');
    INSERT INTO Employee VALUES
      (1, 'Lead', 150000, 1),
      (2, 'SeniorA', 130000, 1),
      (3, 'SeniorB', 130000, 1),
      (4, 'Mid', 110000, 1),
      (5, 'Junior', 90000, 1),
      (6, 'Intern', 60000, 1);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Filters out rank 4 and lower salaries when more than three unique salary tiers exist',
    r4 !== null && $test.equal(r4, [
      { Department: 'R&D', Employee: 'Lead', Salary: 150000 },
      { Department: 'R&D', Employee: 'SeniorA', Salary: 130000 },
      { Department: 'R&D', Employee: 'SeniorB', Salary: 130000 },
      { Department: 'R&D', Employee: 'Mid', Salary: 110000 },
    ]),
    r4
  );
})();
