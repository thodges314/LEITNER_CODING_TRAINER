const query: string = `
SELECT e.name AS "Employee", e.salary AS "Salary", e.department_id AS "DepartmentId"
FROM Employee e
WHERE e.salary > (
  SELECT AVG(salary)
  FROM Employee
  WHERE department_id = e.department_id
)
ORDER BY e.department_id ASC, e.salary DESC, e.name ASC;
`;
