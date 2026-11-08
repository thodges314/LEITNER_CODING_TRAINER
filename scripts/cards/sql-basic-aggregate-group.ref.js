const query = `
SELECT
  department,
  COUNT(*) AS employee_count,
  ROUND(AVG(salary), 2) AS avg_salary
FROM employees
GROUP BY department
HAVING COUNT(*) >= 2
ORDER BY employee_count DESC, department ASC;
`;

