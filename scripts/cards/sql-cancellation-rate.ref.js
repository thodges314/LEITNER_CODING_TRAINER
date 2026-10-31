const query = `
SELECT t.request_at AS "Day",
       ROUND(SUM(CASE WHEN t.status != 'completed' THEN 1.0 ELSE 0.0 END) / COUNT(*), 2)::float AS "Cancellation Rate"
FROM Trips t
JOIN Users c ON t.client_id = c.id AND c.banned = 'No'
JOIN Users d ON t.driver_id = d.id AND d.banned = 'No'
GROUP BY t.request_at
ORDER BY t.request_at ASC;
`;
