import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by PostgreSQL harness', ...o });
const rHarness = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by component harness', ...o });

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

  'next-server-client-leaf-boundary': [
    rHarness(
      'FavoriteButton renders with initial state and accessible aria-pressed',
      '<FavoriteButton productId="p-1" initialFavorited={false} />',
      'renders button with aria-pressed="false" and text "Add to Favorites"'
    ),
    rHarness(
      'FavoriteButton toggles state and calls onToggle callback on click',
      'fire.click(button)',
      'toggles aria-pressed="true", text "Favorited", and fires onToggle("p-1", true)'
    ),
    rHarness(
      'ProductCard renders server product details and embeds FavoriteButton',
      '<ProductCard product={{ id: "prod-99", name: "Wireless Headphones", price: 99 }} />',
      'renders server title "Wireless Headphones", price "$99", and leaf FavoriteButton'
    ),
    rHarness(
      'ProductCard forwards initialFavorited state and toggle callback to leaf component',
      '<ProductCard product={{ id: "prod-99", name: "Wireless Headphones", price: 99 }} initialFavorited={true} onFavoriteToggle={fn} />',
      'starts with aria-pressed="true" and forwards click event to onFavoriteToggle'
    ),
  ],

  'next-fetch-cache-revalidate': [
    c(
      'buildDataCacheConfig builds static cache configuration with force-cache and static segment',
      'buildDataCacheConfig({ strategy: "static", tags: ["blog", "posts"] })',
      '{"fetchOptions":{"cache":"force-cache","next":{"tags":["blog","posts"]}},"segmentConfig":{"dynamic":"force-static","revalidate":false}}'
    ),
    c(
      'buildDataCacheConfig builds timed ISR configuration with explicit revalidate seconds',
      'buildDataCacheConfig({ strategy: "timed", revalidateSeconds: 120, tags: ["products"] })',
      '{"fetchOptions":{"next":{"revalidate":120,"tags":["products"]}},"segmentConfig":{"revalidate":120}}'
    ),
    c(
      'buildDataCacheConfig defaults revalidateSeconds to 60 when omitted or non-positive',
      'buildDataCacheConfig({ strategy: "timed" })',
      '{"fetchOptions":{"next":{"revalidate":60}},"segmentConfig":{"revalidate":60}}'
    ),
    c(
      'buildDataCacheConfig builds dynamic no-store configuration with force-dynamic segment',
      'buildDataCacheConfig({ strategy: "dynamic" })',
      '{"fetchOptions":{"cache":"no-store"},"segmentConfig":{"dynamic":"force-dynamic","revalidate":0}}'
    ),
  ],

  'sql-basic-select-filter': [
    r(
      'Filters by category and stock, sorts by price ASC then name ASC, and limits to 3',
      'query',
      '[{"id":2,"name":"Keyboard","price":50,"stock":25},{"id":3,"name":"Mouse","price":50,"stock":15},{"id":6,"name":"Webcam","price":75,"stock":8}]'
    ),
    r(
      'Excludes out-of-stock electronics even if price is lowest',
      'query',
      '[{"id":2,"name":"Flash Drive","price":15,"stock":4}]'
    ),
    r(
      'Returns empty array when no matching in-stock electronics exist',
      'query',
      '[]'
    ),
    r(
      'Returns empty array on completely empty products table',
      'query',
      '[]'
    ),
  ],

  'sql-basic-inner-join': [
    r(
      'Joins orders with customers and aliases columns ordered by order_id ASC',
      'query',
      '[{"amount":150,"customer_name":"Alice","order_id":101},{"amount":200,"customer_name":"Charlie","order_id":102},{"amount":75,"customer_name":"Alice","order_id":103}]'
    ),
    r(
      'Excludes customers who have placed zero orders',
      'query',
      '[{"amount":320,"customer_name":"Diana","order_id":50}]'
    ),
    r(
      'Excludes orders referencing non-matching customer_ids',
      'query',
      '[]'
    ),
    r(
      'Returns empty array when orders table is empty',
      'query',
      '[]'
    ),
  ],

  'basic-assertion-library': [
    c(
      'ok passes truthy values and throws on falsy values',
      'const a = createAssert();\nlet caught = null;\ntry {\n  a.ok(true);\n  a.ok(1);\n  a.ok("ok");\n  a.ok(0, "Zero is falsy");\n} catch (e) {\n  caught = e.message;\n}\n[caught]',
      '["Zero is falsy"]'
    ),
    c(
      'equal passes matching values using Object.is and throws on mismatch',
      'const a = createAssert();\nlet caught = null;\ntry {\n  a.equal(5, 5);\n  a.equal("abc", "abc");\n  a.equal(1, 2, "1 does not equal 2");\n} catch (e) {\n  caught = e.message;\n}\n[caught]',
      '["1 does not equal 2"]'
    ),
    c(
      'throws validates thrown errors matching string substring or regex pattern',
      'const a = createAssert();\na.throws(() => { throw new Error("database timeout"); }, "timeout");\na.throws(() => { throw new TypeError("invalid arg: 42"); }, /invalid arg/);\n"all passed"',
      '"all passed"'
    ),
    c(
      'throws fails when function does not throw an error',
      'const a = createAssert();\nlet caught = null;\ntry {\n  a.throws(() => { return 42; });\n} catch (e) {\n  caught = e.message;\n}\n[caught]',
      '["Expected function to throw"]'
    ),
  ],

  'dom-toggle-active-class': [
    rHarness(
      'Initializes default closed state and aria-expanded="false"',
      'bindClassToggle({ triggerId: "btn-1", targetId: "menu-1" })',
      'menu has no "active" class, button has aria-expanded="false", isExpanded() is false'
    ),
    rHarness(
      'Toggles active class and aria-expanded on click',
      'btn.dispatchEvent(new MouseEvent("click"))',
      'toggles "active" class on menu and synchronizes aria-expanded between "true" and "false"'
    ),
    rHarness(
      'Initializes with custom active class and initialExpanded=true',
      'bindClassToggle({ triggerId: "btn-2", targetId: "drawer-2", activeClass: "drawer-open", initialExpanded: true })',
      'drawer starts with "drawer-open" class and button has aria-expanded="true"'
    ),
    rHarness(
      'Throws error when target element is missing and removes listener on destroy',
      'c.destroy(); btn.click()',
      'throws on missing DOM nodes and cleans up click event listener so subsequent clicks do not toggle state'
    ),
  ],
};

