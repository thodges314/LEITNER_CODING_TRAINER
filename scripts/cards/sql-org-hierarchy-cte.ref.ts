const query: string = `
WITH RECURSIVE OrgChart AS (
  SELECT
    id,
    name,
    0 AS depth,
    name AS root_leader
  FROM Employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT
    e.id,
    e.name,
    o.depth + 1 AS depth,
    o.root_leader
  FROM Employees e
  JOIN OrgChart o ON e.manager_id = o.id
)
SELECT
  id,
  name,
  depth,
  root_leader
FROM OrgChart
ORDER BY depth ASC, name ASC, id ASC;
`;
