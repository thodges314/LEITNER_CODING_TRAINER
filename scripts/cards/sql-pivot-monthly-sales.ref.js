const query = `
SELECT product,
       COALESCE(SUM(amount) FILTER (WHERE TO_CHAR(sale_date, 'YYYY-MM') = '2024-01'), 0)::INT AS jan_sales,
       COALESCE(SUM(amount) FILTER (WHERE TO_CHAR(sale_date, 'YYYY-MM') = '2024-02'), 0)::INT AS feb_sales,
       COALESCE(SUM(amount) FILTER (WHERE TO_CHAR(sale_date, 'YYYY-MM') = '2024-03'), 0)::INT AS mar_sales
FROM product_sales
GROUP BY product
ORDER BY product ASC;
`;
