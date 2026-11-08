import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by specialized harness', ...o });

export default {
  'sql-basic-aggregate-group': [
    r(
      'Groups by department with count >= 2, calculates avg_salary, and sorts by employee_count DESC then department ASC',
      'SELECT department, COUNT(*), ROUND(AVG(salary), 2) FROM employees GROUP BY department HAVING COUNT(*) >= 2 ORDER BY ...',
      'Engineering (3, 110000), Marketing (2, 75000)'
    ),
    r(
      'Excludes single-employee departments via HAVING filter',
      'HAVING COUNT(*) >= 2 on single-employee teams',
      'Finance (1) and HR (1) excluded, Support (2) returned'
    ),
    r(
      'Rounds average salary accurately to 2 decimal places',
      'ROUND(AVG(salary), 2) on Research salaries',
      '{ department: "Research", employee_count: 3, avg_salary: 102500 }'
    ),
    r(
      'Returns empty array when no department has at least 2 employees',
      'HAVING COUNT(*) >= 2 when all teams have 1 member',
      '[] (empty array)'
    ),
  ],

  'test-suite-runner-describe-it': [
    r(
      'Records passed tests and increments total and passed counts',
      'runner.describe("Arithmetic", () => { runner.it("adds", () => {}); runner.it("multiplies", () => {}); }); runner.getReport()',
      '{ total: 2, passed: 2, failed: 0, errors: [] }'
    ),
    r(
      'Catches thrown errors, increments failed count, and captures error message with suite name',
      'runner.it("fails", () => { throw new Error("Null value prohibited"); })',
      '{ total: 2, passed: 1, failed: 1, errors: [{ suite: "Validation", test: "fails on null", message: "Null value prohibited" }] }'
    ),
    r(
      'Supports multiple suites with correct suite attribution in errors',
      'runner.describe("Suite A", ...); runner.describe("Suite B", ...)',
      '{ total: 4, passed: 2, failed: 2, errors: [{ suite: "Suite A", ... }, { suite: "Suite B", ... }] }'
    ),
    r(
      'reset() clears recorded tests and errors back to zero',
      'runner.reset(); runner.getReport()',
      '{ total: 0, passed: 0, failed: 0, errors: [] }'
    ),
  ],

  'gql-query-field-alias-basics': [
    r(
      'Query parses and validates against avatar GraphQL schema',
      'validateGraphql(testSchema, parseGraphql(userDoc))',
      '[] (zero validation errors)'
    ),
    r(
      'Defines named query GetUserAvatars with required $id variable',
      'query GetUserAvatars($id: ID!)',
      'Operation named GetUserAvatars with variable $id: ID!'
    ),
    r(
      'Queries user with thumb and hero field aliases with size arguments',
      'user(id: $id) { thumb: avatarUrl(size: 64) hero: avatarUrl(size: 512) }',
      'Both aliases declared and bound to avatarUrl field'
    ),
    r(
      'Returns distinct URLs mapped to alias keys in result data',
      'graphql({ variableValues: { id: "user_42" } })',
      '{ data: { user: { thumb: "..._64.png", hero: "..._512.png" } } }'
    ),
  ],

  'tailwind-button-basics': [
    r(
      'Renders button with default primary variant and base interactive classes',
      '<Button>Submit</Button>',
      'button with bg-blue-600, text-white, rounded-lg, type="button"'
    ),
    r(
      'Applies outline variant classes when variant="outline"',
      '<Button variant="outline">Cancel</Button>',
      'button with border-gray-300, text-gray-700, hover:bg-gray-50'
    ),
    r(
      'Applies disabled attribute and opacity/pointer-events utilities when disabled=true',
      '<Button disabled={true}>Disabled</Button>',
      'disabled attribute present, disabled:opacity-50, disabled:pointer-events-none'
    ),
    r(
      'Forwards extra props such as onClick and data-testid',
      '<Button data-testid="custom-btn" onClick={...}>Click</Button>',
      'button receives extra attributes and fires click handlers'
    ),
  ],

  'promise-timeout-reject': [
    r(
      'Resolves with the promise value when fulfilled before timeout',
      'promiseTimeout(resolveAfter(10, "ok"), 80)',
      '"ok"'
    ),
    r(
      'Rejects with the original error when promise rejects before timeout',
      'promiseTimeout(rejectAfter(10, new Error("err")), 80)',
      'rejects with Error("err")'
    ),
    r(
      'Rejects with default Error("Operation timed out") when duration exceeds timeout',
      'promiseTimeout(resolveAfter(100), 20)',
      'rejects with Error("Operation timed out")'
    ),
    r(
      'Rejects with custom error message when specified upon timeout',
      'promiseTimeout(resolveAfter(100), 20, "Gateway request timed out")',
      'rejects with Error("Gateway request timed out")'
    ),
  ],
};
