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
  await db.exec(`CREATE TABLE seat (id INT PRIMARY KEY, student VARCHAR(50));`);

  // Case 1: Swaps seats for odd count keeping last student seat unchanged
  await db.exec(`DELETE FROM seat; INSERT INTO seat VALUES (1, 'Abbot'), (2, 'Doris'), (3, 'Emerson'), (4, 'Green'), (5, 'Jeames');`);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Swaps seats for odd count keeping last student seat unchanged',
    r1 !== null && $test.equal(r1, [
      { id: 1, student: 'Doris' },
      { id: 2, student: 'Abbot' },
      { id: 3, student: 'Green' },
      { id: 4, student: 'Emerson' },
      { id: 5, student: 'Jeames' }
    ]),
    r1
  );

  // Case 2: Swaps seats for even count swapping every pair
  await db.exec(`DELETE FROM seat; INSERT INTO seat VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie'), (4, 'Diana');`);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Swaps seats for even count swapping every pair',
    r2 !== null && $test.equal(r2, [
      { id: 1, student: 'Bob' },
      { id: 2, student: 'Alice' },
      { id: 3, student: 'Diana' },
      { id: 4, student: 'Charlie' }
    ]),
    r2
  );

  // Case 3: Leaves single student seat unchanged
  await db.exec(`DELETE FROM seat; INSERT INTO seat VALUES (1, 'Solo');`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Leaves single student seat unchanged',
    r3 !== null && $test.equal(r3, [
      { id: 1, student: 'Solo' }
    ]),
    r3
  );

  // Case 4: Returns empty array when seat table is empty
  await db.exec(`DELETE FROM seat;`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Returns empty array when seat table is empty',
    r4 !== null && $test.equal(r4, []),
    r4
  );
})();
