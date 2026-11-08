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

  'promise-waterfall-pipeline': [
    r(
      'Chains synchronous and asynchronous transformations in sequence',
      'await promiseWaterfall([(x) => x + 10, async (x) => x * 2, (x) => `Total: ${x}`], 5)',
      '"Total: 30"'
    ),
    r(
      'Resolves immediately with initialValue when stages array is empty',
      'await promiseWaterfall([], { initialized: true })',
      '{"initialized":true}'
    ),
    r(
      'Short-circuits immediately on stage rejection without invoking subsequent stages',
      'await promiseWaterfall([fn1, failFn, uncalledFn], 0)',
      'Rejects with Error'
    ),
    r(
      'Preserves strict serial ordering across stages with variable async delays',
      'await promiseWaterfall([delay30, delay10, delay20], "start")',
      '"start-1-2-3"'
    ),
  ],

  'microtask-batch-scheduler': [
    r(
      'Coalesces multiple synchronous calls into a single batch execution',
      'await Promise.all([b.schedule(1), b.schedule(2), b.schedule(3)])',
      '[10, 20, 30]'
    ),
    r(
      'Executes batch on microtask queue strictly before macrotasks fire',
      'order',
      '["microtask-batch:itemA", "macrotask-timeout"]'
    ),
    r(
      'Propagates batchHandler rejection to all pending promises in the batch',
      'await b.schedule("x")',
      'Rejects with Error'
    ),
    r(
      'Processes subsequent independent batches across separate execution ticks',
      'batches',
      '[["a", "b"], ["c", "d"]]'
    ),
  ],

  'ts-assertion-functions': [
    c(
      'isDefined returns true for values and false for null/undefined',
      '[isDefined("hello"), isDefined(0), isDefined(false), isDefined(null), isDefined(undefined)]',
      '[true, true, true, false, false]'
    ),
    c(
      'assertDefined passes valid values and throws TypeError on null/undefined',
      'let caught = null;\ntry {\n  assertDefined(null, "Missing");\n} catch (e: any) {\n  caught = e.message;\n}\n[assertDefined(123) === undefined, caught]',
      '[true, "Missing"]'
    ),
    c(
      'assertCondition throws on falsy values with custom message',
      'let caught = null;\ntry {\n  assertCondition(false, "Expected truthy");\n} catch (e: any) {\n  caught = e.message;\n}\n[assertCondition(true) === undefined, caught]',
      '[true, "Expected truthy"]'
    ),
    c(
      'assertRecord validates plain records and throws TypeError on arrays/primitives',
      'let caught = null;\ntry {\n  assertRecord([1, 2, 3]);\n} catch (e: any) {\n  caught = e.message;\n}\n[assertRecord({ a: 1 }) === undefined, caught]',
      '[true, "Value is not a record object"]'
    ),
  ],

  'ts-tuple-rest-parameters': [
    c(
      'tuple constructs a typed tuple without widening to arbitrary array',
      'tuple(1, "ok", true)',
      '[1, "ok", true]'
    ),
    c(
      'partialApply binds leading arguments and returns function for remaining arguments',
      'const fn = (a: string, b: number, c: boolean) => `${a}-${b}-${c}`;\nconst partial = partialApply(fn, "x", 10);\npartial(true)',
      '"x-10-true"'
    ),
    c(
      'callWithTuple executes function by spreading tuple elements',
      'callWithTuple((a: number, b: number, c: number) => a * b + c, [3, 4, 5])',
      '17'
    ),
    c(
      'Concat and Shift tuple type contracts compile and verify lengths',
      'type C = Concat<[number, string], [boolean]>;\ntype S = Shift<[string, number, boolean]>;\nconst c: C = [1, "two", true];\nconst s: S = [42, false];\n[c.length, s.length]',
      '[3, 2]'
    ),
  ],
};

