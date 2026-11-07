SELECT id, task_name, priority
FROM job_queue
WHERE status = 'pending'
ORDER BY priority DESC, created_at ASC, id ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
