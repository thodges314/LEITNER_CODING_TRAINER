const query = `
SELECT o.id AS order_id, c.name AS customer_name, o.amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.id ASC;
`;
