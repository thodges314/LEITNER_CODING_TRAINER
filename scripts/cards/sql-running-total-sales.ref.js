const query = `
SELECT order_date, amount,
       SUM(amount) OVER (ORDER BY order_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM Orders
ORDER BY order_date ASC, id ASC;
`;
