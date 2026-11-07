import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by PostgreSQL harness', ...o });

export default {
  'sql-sequential-gaps': [
    r(
      'Finds multiple missing sequence ranges in tracking log IDs',
      'query',
      '[{"gap_end":4,"gap_size":2,"gap_start":3},{"gap_end":9,"gap_size":2,"gap_start":8}]'
    ),
    r(
      'Detects single isolated missing identifier gap',
      'query',
      '[{"gap_end":12,"gap_size":1,"gap_start":12}]'
    ),
    r(
      'Returns empty array when sequence is strictly contiguous',
      'query',
      '[]'
    ),
    r(
      'Returns empty array when table contains fewer than two rows',
      'query',
      '[]'
    ),
  ],

  'sql-worker-queue-skip-locked': [
    r(
      'Claims highest-priority pending task using FOR UPDATE SKIP LOCKED',
      'query',
      '[{"id":2,"priority":50,"task_name":"process_payment"}]'
    ),
    r(
      'Breaks priority ties using oldest created timestamp',
      'query',
      '[{"id":11,"priority":30,"task_name":"sync_inventory"}]'
    ),
    r(
      'Ignores non-pending tasks and picks highest pending task',
      'query',
      '[{"id":23,"priority":15,"task_name":"send_sms_alert"}]'
    ),
    r(
      'Returns empty array when queue has no pending tasks',
      'query',
      '[]'
    ),
  ],
};

