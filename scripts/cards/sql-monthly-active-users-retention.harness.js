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
  await db.exec(`CREATE TABLE user_actions (user_id INT, action_date DATE, action_type VARCHAR(20));`);

  // Case 1: Calculates month-over-month retained users across consecutive months
  await db.exec(`
    DELETE FROM user_actions;
    INSERT INTO user_actions VALUES
      (1, '2024-01-15', 'login'),
      (2, '2024-01-20', 'login'),
      (1, '2024-02-05', 'purchase'),
      (3, '2024-02-18', 'login'),
      (1, '2024-03-12', 'login'),
      (3, '2024-03-25', 'login');
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Calculates month-over-month retained users across consecutive months',
    r1 !== null && $test.equal(r1, [
      { month: '2024-02', retained_users: 1 },
      { month: '2024-03', retained_users: 2 }
    ]),
    r1
  );

  // Case 2: Returns empty array when users are active in non-consecutive months only
  await db.exec(`
    DELETE FROM user_actions;
    INSERT INTO user_actions VALUES
      (1, '2024-01-10', 'login'),
      (1, '2024-03-10', 'login'),
      (2, '2024-02-15', 'login'),
      (2, '2024-04-15', 'login');
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when users are active in non-consecutive months only',
    r2 !== null && $test.equal(r2, []),
    r2
  );

  // Case 3: Only counts each user once even with multiple actions in each month
  await db.exec(`
    DELETE FROM user_actions;
    INSERT INTO user_actions VALUES
      (10, '2024-05-01', 'login'),
      (10, '2024-05-15', 'purchase'),
      (10, '2024-06-02', 'view'),
      (10, '2024-06-20', 'login');
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Only counts each user once even with multiple actions in each month',
    r3 !== null && $test.equal(r3, [
      { month: '2024-06', retained_users: 1 }
    ]),
    r3
  );

  // Case 4: Returns empty array when user_actions table is empty
  await db.exec(`DELETE FROM user_actions;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when user_actions table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
