const query = `
SELECT id, name, price, stock
FROM products
WHERE category = 'Electronics' AND stock > 0
ORDER BY price ASC, name ASC
LIMIT 3;
`;
