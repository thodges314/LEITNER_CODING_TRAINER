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
  await db.exec(`CREATE TABLE Logs (id INT PRIMARY KEY, num INT);`);

  // Case 1: Standard sequence with single consecutive number
  await db.exec(`DELETE FROM Logs; INSERT INTO Logs VALUES (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2);`);
  const r1 = await runSafe(db, userSql);
  $test.check(
    'Finds single number appearing three consecutive times',
    r1 !== null && $test.equal(r1, [{ ConsecutiveNums: 1 }]),
    r1
  );

  // Case 2: Multiple distinct numbers appearing consecutively
  await db.exec(`DELETE FROM Logs; INSERT INTO Logs VALUES (1, 1), (2, 1), (3, 1), (4, 2), (5, 3), (6, 3), (7, 3);`);
  const r2 = await runSafe(db, userSql);
  $test.check(
    'Finds multiple numbers that appear at least three consecutive times',
    r2 !== null && $test.equal(r2, [{ ConsecutiveNums: 1 }, { ConsecutiveNums: 3 }]),
    r2
  );

  // Case 3: No consecutive repeats
  await db.exec(`DELETE FROM Logs; INSERT INTO Logs VALUES (1, 1), (2, 2), (3, 1), (4, 2), (5, 1);`);
  const r3 = await runSafe(db, userSql);
  $test.check(
    'Returns empty list when no numbers repeat consecutively',
    r3 !== null && $test.equal(r3, []),
    r3
  );

  // Case 4: Four consecutive identical numbers (should only return distinct row once)
  await db.exec(`DELETE FROM Logs; INSERT INTO Logs VALUES (1, 5), (2, 5), (3, 5), (4, 5), (5, 9);`);
  const r4 = await runSafe(db, userSql);
  $test.check(
    'Handles runs of four or more consecutive identical numbers without duplicate rows',
    r4 !== null && $test.equal(r4, [{ ConsecutiveNums: 5 }]),
    r4
  );
})();
