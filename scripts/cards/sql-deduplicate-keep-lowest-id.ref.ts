const query: string = `
WITH ranked AS (
  SELECT id, name, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY id ASC) AS rn
  FROM contacts
)
SELECT id, name, email
FROM ranked
WHERE rn = 1
ORDER BY id ASC;
`;
