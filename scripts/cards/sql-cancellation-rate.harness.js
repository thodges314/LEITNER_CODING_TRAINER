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
    CREATE TABLE Users (id INT PRIMARY KEY, banned TEXT, role TEXT);
    CREATE TABLE Trips (id INT PRIMARY KEY, client_id INT, driver_id INT, status TEXT, request_at TEXT);
  `);

  // Case 1: Multiple trips across days with banned users filtered
  await db.exec(`
    INSERT INTO Users VALUES
      (1, 'No', 'client'),
      (2, 'Yes', 'client'),
      (3, 'No', 'client'),
      (10, 'No', 'driver'),
      (11, 'No', 'driver'),
      (12, 'Yes', 'driver');
    INSERT INTO Trips VALUES
      (1, 1, 10, 'completed', '2024-03-01'),
      (2, 1, 11, 'cancelled_by_driver', '2024-03-01'),
      (3, 2, 10, 'cancelled_by_client', '2024-03-01'),
      (4, 3, 10, 'completed', '2024-03-02'),
      (5, 1, 12, 'cancelled_by_client', '2024-03-02');
  `);
  const r1 = await runSafe(db, userSql);
  $test.check('Computes cancellation rate for unbanned users', r1 !== null && $test.equal(r1, [
    { Day: '2024-03-01', 'Cancellation Rate': 0.5 },
    { Day: '2024-03-02', 'Cancellation Rate': 0 },
  ]), r1);

  // Case 2: All trips completed (0.0 cancellation rate)
  await db.exec(`
    DELETE FROM Trips;
    INSERT INTO Trips VALUES (1, 1, 10, 'completed', '2024-03-05');
  `);
  const r2 = await runSafe(db, userSql);
  $test.check('Returns 0 when all trips are completed', r2 !== null && $test.equal(r2, [
    { Day: '2024-03-05', 'Cancellation Rate': 0 },
  ]), r2);

  // Case 3: Empty trips
  await db.exec(`DELETE FROM Trips;`);
  const r3 = await runSafe(db, userSql);
  $test.check('Returns empty when no trips exist', r3 !== null && $test.equal(r3, []), r3);

  // Case 4: 100% cancellation rate
  await db.exec(`
    DELETE FROM Trips; DELETE FROM Users;
    INSERT INTO Users VALUES (1, 'No', 'client'), (10, 'No', 'driver');
    INSERT INTO Trips VALUES (1, 1, 10, 'cancelled_by_client', '2024-04-01');
  `);
  const r4 = await runSafe(db, userSql);
  $test.check('Returns 1 when all unbanned trips are cancelled', r4 !== null && $test.equal(r4, [
    { Day: '2024-04-01', 'Cancellation Rate': 1 },
  ]), r4);
})();
