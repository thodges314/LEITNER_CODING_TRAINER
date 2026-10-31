const query = `
SELECT c.email, COUNT(o.id) AS order_count, SUM(o.amount) AS total_spent
FROM Customers c
JOIN Orders o ON c.id = o.customer_id
GROUP BY c.id, c.email
HAVING COUNT(o.id) >= 2
ORDER BY total_spent DESC, c.email ASC;
`;
