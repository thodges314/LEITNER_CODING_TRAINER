import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

export default {
  'custom-matcher-expect': [
    c(
      'toBe asserts identity equality and not.toBe asserts inequality',
      `[expect(42).toBe(42).pass, expect(42).not.toBe(100).pass]`,
      `[true, true]`
    ),
    c(
      'toBe throws an Error with message when comparison fails',
      `let err = null;
try {
  expect('apple').toBe('orange');
} catch (e) {
  err = e.message;
}
Boolean(err && err.includes('Expected orange but received apple'))`,
      `true`
    ),
    c(
      'expect.extend registers custom matchers and evaluates pass',
      `expect.extend({
  toBeEven(received) {
    const pass = received % 2 === 0;
    return {
      pass,
      message: () => \`expected \${received} to be even\`,
    };
  },
});
[expect(4).toBeEven().pass, expect(5).not.toBeEven().pass]`,
      `[true, true]`
    ),
    c(
      'Custom matcher fails and throws Error returned by message()',
      `expect.extend({
  toHaveLength(received, length) {
    const pass = received.length === length;
    return {
      pass,
      message: () => \`expected length \${length} but got \${received.length}\`,
    };
  },
});
let errMsg = '';
try {
  expect([1, 2, 3]).toHaveLength(5);
} catch (e) {
  errMsg = e.message;
}
errMsg`,
      `'expected length 5 but got 3'`
    ),
    c(
      'Multiple expect.extend calls accumulate without overwriting',
      `expect.extend({
  toBePositive(n) { return { pass: n > 0, message: () => 'must be positive' }; },
});
expect.extend({
  toBeNegative(n) { return { pass: n < 0, message: () => 'must be negative' }; },
});
[expect(10).toBePositive().pass, expect(-5).toBeNegative().pass]`,
      `[true, true]`
    ),
  ],

  'async-flush-promises': [
    c(
      'flushMicrotasks drains queued microtask promises',
      `const tester = createAsyncTester();
let completed = false;
Promise.resolve().then(() => {
  completed = true;
});
await tester.flushMicrotasks(1);
completed`,
      `true`
    ),
    c(
      'flushMacrotasks drains pending setTimeout macrotasks',
      `const tester = createAsyncTester();
let step = 0;
setTimeout(() => {
  step = 42;
}, 0);
await tester.flushMacrotasks(1);
step`,
      `42`
    ),
    c(
      'pumpEventQueue drains cascading macrotasks and microtasks',
      `const tester = createAsyncTester();
const order = [];
setTimeout(() => {
  order.push('macro');
  Promise.resolve().then(() => order.push('micro'));
}, 0);
await tester.pumpEventQueue(1);
order`,
      `['macro', 'micro']`
    ),
    c(
      'waitForCondition resolves truthy value when predicate passes',
      `const tester = createAsyncTester();
let count = 0;
setTimeout(() => { count = 5; }, 20);
await tester.waitForCondition(() => count === 5 ? 'ready' : false, { timeout: 200, interval: 5 })`,
      `'ready'`
    ),
    c(
      'waitForCondition rejects with Error on timeout',
      `const tester = createAsyncTester();
let errorMsg = '';
try {
  await tester.waitForCondition(() => false, { timeout: 30, interval: 10 });
} catch (e) {
  errorMsg = e.message;
}
errorMsg`,
      `'Timed out waiting for condition'`
    ),
  ],

  'dom-query-testing-library': [
    r(
      'getByRole finds element by explicit role attribute',
      `const { getByRole } = createDomQueries();
const div = document.createElement('div');
div.innerHTML = '<div role="alert">Warning!</div>';
getByRole(div, 'alert').textContent`,
      `'Warning!'`
    ),
    r(
      'getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)',
      `const { getByRole } = createDomQueries();
const div = document.createElement('div');
div.innerHTML = '<button>Save</button><a href="/home">Home</a><h2>Title</h2><input type="text" />';
[
  getByRole(div, 'button').tagName,
  getByRole(div, 'link').tagName,
  getByRole(div, 'heading').tagName,
  getByRole(div, 'textbox').tagName,
]`,
      `['BUTTON', 'A', 'H2', 'INPUT']`
    ),
    r(
      'getByRole filters by accessible name (textContent, aria-label, label[for])',
      `const { getByRole } = createDomQueries();
const div = document.createElement('div');
div.innerHTML = '<button>Cancel</button><button aria-label="Confirm Action">OK</button>';
getByRole(div, 'button', { name: 'Confirm Action' }).textContent`,
      `'OK'`
    ),
    r(
      'getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors',
      `const { getByRole, queryByRole } = createDomQueries();
const div = document.createElement('div');
div.innerHTML = '<button>One</button><button>Two</button>';
const nullResult = queryByRole(div, 'textbox');
let multipleError = false;
try {
  getByRole(div, 'button');
} catch (e) {
  multipleError = true;
}
[nullResult, multipleError]`,
      `[null, true]`
    ),
    r(
      'getByText and queryByText find deepest element matching text or regex',
      `const { getByText, queryByText } = createDomQueries();
const div = document.createElement('div');
div.innerHTML = '<div><span>Status: <b>Active</b></span></div>';
[
  getByText(div, 'Active').tagName,
  queryByText(div, /^status:/i)?.textContent?.includes('Active'),
  queryByText(div, 'Nonexistent'),
]`,
      `['B', true, null]`
    ),
  ],
};
