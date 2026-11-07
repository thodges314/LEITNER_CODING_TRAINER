WITH ranked_logs AS (
  SELECT
    log_id,
    LEAD(log_id) OVER (ORDER BY log_id ASC) AS next_id
  FROM tracking_logs
)
SELECT
  log_id + 1 AS gap_start,
  next_id - 1 AS gap_end,
  (next_id - log_id - 1) AS gap_size
FROM ranked_logs
WHERE next_id - log_id > 1
ORDER BY gap_start ASC;

