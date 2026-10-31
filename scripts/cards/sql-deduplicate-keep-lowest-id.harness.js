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
  await db.exec(`CREATE TABLE contacts (id INT PRIMARY KEY, name VARCHAR(50), email VARCHAR(100));`);

  // Case 1: Deduplicates multiple identical emails retaining the row with lowest id
  await db.exec(`DELETE FROM contacts; INSERT INTO contacts VALUES (1, 'Alice Smith', 'alice@example.com'), (2, 'Bob Jones', 'bob@example.com'), (3, 'Alice S.', 'alice@example.com'), (4, 'Charlie Brown', 'charlie@example.com'), (5, 'Bob Duplicate', 'bob@example.com');`);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Deduplicates multiple identical emails retaining the row with lowest id',
    r1 !== null && $test.equal(r1, [
      { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
      { id: 2, name: 'Bob Jones', email: 'bob@example.com' },
      { id: 4, name: 'Charlie Brown', email: 'charlie@example.com' }
    ]),
    r1
  );

  // Case 2: Preserves all records when all emails are already distinct
  await db.exec(`DELETE FROM contacts; INSERT INTO contacts VALUES (10, 'Dave', 'dave@example.com'), (20, 'Eve', 'eve@example.com');`);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Preserves all records when all emails are already distinct',
    r2 !== null && $test.equal(r2, [
      { id: 10, name: 'Dave', email: 'dave@example.com' },
      { id: 20, name: 'Eve', email: 'eve@example.com' }
    ]),
    r2
  );

  // Case 3: Returns empty array when contacts table is empty
  await db.exec(`DELETE FROM contacts;`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when contacts table is empty',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Correctly chooses lowest id when duplicate records appear out of order
  await db.exec(`DELETE FROM contacts; INSERT INTO contacts VALUES (99, 'Zoe Late', 'zoe@example.com'), (5, 'Zoe First', 'zoe@example.com'), (42, 'Zoe Mid', 'zoe@example.com');`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Correctly chooses lowest id when duplicate records appear out of order',
    r4 !== null && $test.equal(r4, [
      { id: 5, name: 'Zoe First', email: 'zoe@example.com' }
    ]),
    r4
  );
})();
