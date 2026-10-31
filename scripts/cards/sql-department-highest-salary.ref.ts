const query: string = `
WITH Ranked AS (
  SELECT d.name AS "Department", e.name AS "Employee", e.salary AS "Salary",
         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk
  FROM Employee e
  JOIN Department d ON e.department_id = d.id
)
SELECT "Department", "Employee", "Salary"
FROM Ranked
WHERE rnk = 1
ORDER BY "Department" ASC, "Employee" ASC;
`;
