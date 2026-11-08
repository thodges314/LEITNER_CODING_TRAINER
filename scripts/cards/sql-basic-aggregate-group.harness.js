await (async () => {
  const userSql = typeof query === 'function' ? query() : (typeof query !== 'undefined' ? query : '');
  async function runSafe(db: any, sql: string) {
    try {
      const res = await db.query(sql);
      return res.rows.map((row: any) => ({
        ...row,
        employee_count: Number(row.employee_count),
        avg_salary: Number(row.avg_salary),
      }));
    } catch {
      return null;
    }
  }

  const db = new PGlite();
  await db.exec(`
    CREATE TABLE employees (
      id INT PRIMARY KEY,
      name VARCHAR(50),
      department VARCHAR(50),
      salary INT
    );
  `);

  const case1 = 'Groups by department with count >= 2, calculates avg_salary, and sorts by employee_count DESC then department ASC';
  const case2 = 'Excludes single-employee departments via HAVING filter';
  const case3 = 'Rounds average salary accurately to 2 decimal places';
  const case4 = 'Returns empty array when no department has at least 2 employees';

  // Case 1: Standard aggregation and multi-key sorting
  await db.exec(`
    DELETE FROM employees;
    INSERT INTO employees VALUES
      (1, 'Alice', 'Engineering', 120000),
      (2, 'Bob', 'Engineering', 100000),
      (3, 'Charlie', 'Engineering', 110000),
      (4, 'Diana', 'Marketing', 80000),
      (5, 'Evan', 'Marketing', 70000),
      (6, 'Fiona', 'Design', 95000);
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    case1,
    r1 !== null && $test.equal(r1, [
      { department: 'Engineering', employee_count: 3, avg_salary: 110000 },
      { department: 'Marketing', employee_count: 2, avg_salary: 75000 },
    ]),
    r1
  );

  // Case 2: Excludes departments with only 1 employee
  await db.exec(`
    DELETE FROM employees;
    INSERT INTO employees VALUES
      (1, 'George', 'Finance', 90000),
      (2, 'Hannah', 'HR', 75000),
      (3, 'Ian', 'Support', 60000),
      (4, 'Julia', 'Support', 64000);
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    case2,
    r2 !== null && $test.equal(r2, [
      { department: 'Support', employee_count: 2, avg_salary: 62000 },
    ]),
    r2
  );

  // Case 3: Rounds average salary to 2 decimal places
  await db.exec(`
    DELETE FROM employees;
    INSERT INTO employees VALUES
      (1, 'Kevin', 'Research', 100000),
      (2, 'Laura', 'Research', 105000),
      (3, 'Mike', 'Research', 102500);
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    case3,
    r3 !== null && r3.length === 1 && r3[0].department === 'Research' && r3[0].employee_count === 3 && r3[0].avg_salary === 102500,
    r3
  );

  // Case 4: Returns empty array when no department has at least 2 employees
  await db.exec(`
    DELETE FROM employees;
    INSERT INTO employees VALUES
      (1, 'Nina', 'Legal', 130000),
      (2, 'Oscar', 'Security', 115000);
  `);
  const r4 = await runSafe(db, userSql);
  $test.check(
    case4,
    r4 !== null && Array.isArray(r4) && r4.length === 0,
    r4
  );
})();

