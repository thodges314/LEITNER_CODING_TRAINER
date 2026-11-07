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
  await db.exec(`CREATE TABLE tracking_logs (log_id INT PRIMARY KEY, event_name TEXT, logged_at TIMESTAMP);`);

  // Case 1: Multiple sequence gaps in tracking IDs
  await db.exec(`
    DELETE FROM tracking_logs;
    INSERT INTO tracking_logs VALUES
      (1, 'auth', '2024-01-01 10:00:00'),
      (2, 'login', '2024-01-01 10:01:00'),
      (5, 'view', '2024-01-01 10:04:00'),
      (6, 'click', '2024-01-01 10:05:00'),
      (7, 'cart', '2024-01-01 10:06:00'),
      (10, 'checkout', '2024-01-01 10:09:00'),
      (11, 'logout', '2024-01-01 10:10:00');
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Finds multiple missing sequence ranges in tracking log IDs',
    r1 !== null && $test.equal(r1, [
      { gap_start: 3, gap_end: 4, gap_size: 2 },
      { gap_start: 8, gap_end: 9, gap_size: 2 }
    ]),
    r1
  );

  // Case 2: Single missing ID gap of size 1
  await db.exec(`
    DELETE FROM tracking_logs;
    INSERT INTO tracking_logs VALUES
      (10, 'init', '2024-02-01 08:00:00'),
      (11, 'start', '2024-02-01 08:01:00'),
      (13, 'finish', '2024-02-01 08:03:00'),
      (14, 'cleanup', '2024-02-01 08:04:00');
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Detects single isolated missing identifier gap',
    r2 !== null && $test.equal(r2, [
      { gap_start: 12, gap_end: 12, gap_size: 1 }
    ]),
    r2
  );

  // Case 3: Contiguous sequence with zero gaps
  await db.exec(`
    DELETE FROM tracking_logs;
    INSERT INTO tracking_logs VALUES
      (100, 'step1', '2024-03-01 12:00:00'),
      (101, 'step2', '2024-03-01 12:01:00'),
      (102, 'step3', '2024-03-01 12:02:00'),
      (103, 'step4', '2024-03-01 12:03:00');
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when sequence is strictly contiguous',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Table with single entry or fewer than two rows
  await db.exec(`
    DELETE FROM tracking_logs;
    INSERT INTO tracking_logs VALUES
      (42, 'only_record', '2024-04-01 15:00:00');
  `);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when table contains fewer than two rows',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();

