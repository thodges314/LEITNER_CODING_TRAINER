await (async () => {
  const userSql = typeof query === 'function' ? query() : (typeof query !== 'undefined' ? query : '');
  async function runSafe(db, sql) {
    try {
      return (await db.query(sql)).rows;
    } catch {
      return null;
    }
  }

  const hasSkipLocked = /for\s+update\s+skip\s+locked/i.test(userSql);
  const db = new PGlite();
  await db.exec(`
    CREATE TABLE job_queue (
      id INT PRIMARY KEY,
      task_name TEXT NOT NULL,
      status TEXT NOT NULL,
      priority INT NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL
    );
  `);

  // Case 1: Claims highest-priority pending task using FOR UPDATE SKIP LOCKED
  await db.exec(`
    DELETE FROM job_queue;
    INSERT INTO job_queue VALUES
      (1, 'send_welcome_email', 'pending', 10, 0, '2024-01-01 10:00:00'),
      (2, 'process_payment', 'pending', 50, 0, '2024-01-01 10:05:00'),
      (3, 'generate_analytics', 'processing', 100, 1, '2024-01-01 10:02:00'),
      (4, 'resize_avatar', 'pending', 20, 0, '2024-01-01 10:01:00');
  `);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Claims highest-priority pending task using FOR UPDATE SKIP LOCKED',
    hasSkipLocked && r1 !== null && $test.equal(r1, [{ id: 2, task_name: 'process_payment', priority: 50 }]),
    r1
  );

  // Case 2: Breaks priority ties using oldest created timestamp
  await db.exec(`
    DELETE FROM job_queue;
    INSERT INTO job_queue VALUES
      (10, 'export_csv', 'pending', 30, 0, '2024-02-01 09:15:00'),
      (11, 'sync_inventory', 'pending', 30, 0, '2024-02-01 09:05:00'),
      (12, 'dispatch_webhook', 'pending', 30, 0, '2024-02-01 09:20:00');
  `);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Breaks priority ties using oldest created timestamp',
    hasSkipLocked && r2 !== null && $test.equal(r2, [{ id: 11, task_name: 'sync_inventory', priority: 30 }]),
    r2
  );

  // Case 3: Ignores non-pending tasks and picks highest pending task
  await db.exec(`
    DELETE FROM job_queue;
    INSERT INTO job_queue VALUES
      (21, 'rebuild_search_index', 'failed', 99, 3, '2024-03-01 12:00:00'),
      (22, 'purge_cache', 'completed', 80, 1, '2024-03-01 12:05:00'),
      (23, 'send_sms_alert', 'pending', 15, 0, '2024-03-01 12:10:00');
  `);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Ignores non-pending tasks and picks highest pending task',
    hasSkipLocked && r3 !== null && $test.equal(r3, [{ id: 23, task_name: 'send_sms_alert', priority: 15 }]),
    r3
  );

  // Case 4: Returns empty array when queue has no pending tasks
  await db.exec(`
    DELETE FROM job_queue;
    INSERT INTO job_queue VALUES
      (31, 'archive_logs', 'completed', 10, 1, '2024-04-01 15:00:00');
  `);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when queue has no pending tasks',
    hasSkipLocked && r4 !== null && $test.equal(r4, []),
    r4
  );
})();
