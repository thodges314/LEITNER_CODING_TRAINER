const query: string = `
WITH RankedEmployees AS (
  SELECT
    d.name AS "Department",
    e.name AS "Employee",
    e.salary AS "Salary",
    DENSE_RANK() OVER (
      PARTITION BY e.departmentId
      ORDER BY e.salary DESC
    ) AS rank
  FROM Employee e
  JOIN Department d ON e.departmentId = d.id
)
SELECT "Department", "Employee", "Salary"
FROM RankedEmployees
WHERE rank <= 3
ORDER BY "Department" ASC, "Salary" DESC, "Employee" ASC;
`;
