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
  await db.exec(`CREATE TABLE user_events (event_id INT PRIMARY KEY, user_id INT, event_time TIMESTAMP);`);

  // Case 1: Sessionizes user events into distinct sessions based on 30-minute inactivity gap
  await db.exec(`
    DELETE FROM user_events;
    INSERT INTO user_events VALUES
      (1, 1, '2024-01-01 10:00:00'),
      (2, 1, '2024-01-01 10:15:00'),
      (3, 1, '2024-01-01 10:50:00'),
      (4, 2, '2024-01-01 12:00:00');
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Sessionizes user events into distinct sessions based on 30-minute inactivity gap',
    r1 !== null && $test.equal(r1, [
      { event_id: 1, user_id: 1, session_id: '1-1' },
      { event_id: 2, user_id: 1, session_id: '1-1' },
      { event_id: 3, user_id: 1, session_id: '1-2' },
      { event_id: 4, user_id: 2, session_id: '2-1' }
    ]),
    r1
  );

  // Case 2: Groups all events into single session when intervals never exceed 30 minutes
  await db.exec(`
    DELETE FROM user_events;
    INSERT INTO user_events VALUES
      (10, 5, '2024-02-01 08:00:00'),
      (11, 5, '2024-02-01 08:20:00'),
      (12, 5, '2024-02-01 08:45:00');
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Groups all events into single session when intervals never exceed 30 minutes',
    r2 !== null && $test.equal(r2, [
      { event_id: 10, user_id: 5, session_id: '5-1' },
      { event_id: 11, user_id: 5, session_id: '5-1' },
      { event_id: 12, user_id: 5, session_id: '5-1' }
    ]),
    r2
  );

  // Case 3: Creates separate session for every event when gap between each event exceeds 30 minutes
  await db.exec(`
    DELETE FROM user_events;
    INSERT INTO user_events VALUES
      (21, 9, '2024-03-01 09:00:00'),
      (22, 9, '2024-03-01 10:00:00'),
      (23, 9, '2024-03-01 11:30:00');
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Creates separate session for every event when gap between each event exceeds 30 minutes',
    r3 !== null && $test.equal(r3, [
      { event_id: 21, user_id: 9, session_id: '9-1' },
      { event_id: 22, user_id: 9, session_id: '9-2' },
      { event_id: 23, user_id: 9, session_id: '9-3' }
    ]),
    r3
  );

  // Case 4: Returns empty array when user_events table is empty
  await db.exec(`DELETE FROM user_events;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when user_events table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
