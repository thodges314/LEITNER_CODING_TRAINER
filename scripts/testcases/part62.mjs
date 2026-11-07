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

  'test-each-data-driven': [
    r(
      'Registers parameterized test cases from 2D array with formatted titles',
      'createTestEach(reg)([[1, 2, 3], [4, 5, 9]])("%i + %i = %d", fn)',
      '["1 + 2 = 3", "4 + 5 = 9"]'
    ),
    r(
      'Interpolates object properties using $placeholder syntax',
      'createTestEach(reg)([{ role: "admin", level: 1 }])("User $role has level $level", fn)',
      '["User admin has level 1"]'
    ),
    r(
      'Handles 1D array of single-argument values and %s placeholders',
      'createTestEach(reg)(["alpha", "beta"])("stage %s is valid", fn)',
      '["stage alpha is valid", "stage beta is valid"]'
    ),
    r(
      'Supports asynchronous test execution functions',
      'createTestEach(reg)([[100]])("delays by %d ms", asyncFn)',
      'true'
    ),
    r(
      'Safely ignores empty or non-array tables without registering tests',
      'createTestEach(reg)([])("test", fn)',
      '[]'
    ),
  ],

  'render-hook-harness': [
    r(
      'Mounts hook and provides live result.current across state mutations',
      'renderHook(() => useCounter()).result.current',
      '{ count: 0 }'
    ),
    r(
      'Re-renders hook with updated initialProps via rerender()',
      'h.rerender({ step: 20 })',
      '{ val: 25 }'
    ),
    r(
      'Executes useEffect cleanup handler on unmount()',
      'h.unmount()',
      'true'
    ),
    r(
      'Wraps test component with custom Context provider wrapper',
      'renderHook(() => useTheme(), { wrapper })',
      '"night-mode"'
    ),
  ],
};

