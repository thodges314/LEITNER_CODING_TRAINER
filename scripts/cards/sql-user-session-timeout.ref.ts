const query: string = `
WITH event_gaps AS (
  SELECT event_id, user_id, event_time,
         CASE
           WHEN event_time - LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) > INTERVAL '30 minutes'
             OR LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) IS NULL
           THEN 1
           ELSE 0
         END AS is_new_session
  FROM user_events
),
session_numbered AS (
  SELECT event_id, user_id, event_time,
         SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_seq
  FROM event_gaps
)
SELECT event_id, user_id,
       user_id || '-' || session_seq AS session_id
FROM session_numbered
ORDER BY event_id ASC;
`;
