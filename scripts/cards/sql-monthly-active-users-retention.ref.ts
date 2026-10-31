const query: string = `
WITH user_months AS (
  SELECT DISTINCT user_id, DATE_TRUNC('month', action_date)::DATE AS act_month
  FROM user_actions
)
SELECT TO_CHAR(curr.act_month, 'YYYY-MM') AS month,
       COUNT(DISTINCT curr.user_id)::INT AS retained_users
FROM user_months curr
JOIN user_months prev
  ON curr.user_id = prev.user_id
 AND curr.act_month = (prev.act_month + INTERVAL '1 month')::DATE
GROUP BY curr.act_month
ORDER BY month ASC;
`;
