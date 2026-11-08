import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by specialized harness', ...o });

export default {
  'promise-sleep-delay': [
    r(
      'delay(ms) resolves after specified duration with undefined',
      'await delay(30)',
      'resolves undefined after >= 20ms'
    ),
    r(
      'delayValue(value, ms) resolves with given value after timer',
      'await delayValue("data_payload", 30)',
      '"data_payload"'
    ),
    r(
      'delay handles non-positive values immediately without error',
      'await delay(0); await delay(-100); await delayValue(42, 0)',
      'resolves immediately with 42'
    ),
    r(
      'Chains sequential delays correctly',
      'await delay(15); await delayValue({ ready: true }, 15)',
      '{ ready: true }'
    ),
  ],

  'mock-fn-spy-basics': [
    r(
      'Tracks callCount, arguments, and return values in calls array',
      'const add = createSpy((a, b) => a + b); add(2, 3); add(10, 20)',
      '{ callCount: 2, calls: [{ args: [2, 3], returned: 5 }, { args: [10, 20], returned: 30 }] }'
    ),
    r(
      'Propagates thrown exceptions and records error in call history',
      'const thrower = createSpy(() => { throw new Error("Boom"); }); thrower("param1")',
      'rethrows Error("Boom") and records { args: ["param1"], threw: Error }'
    ),
    r(
      'mockReturnValue overrides return value and returns spy for chaining',
      'const spy = createSpy(); spy.mockReturnValue(42); spy("first")',
      '42'
    ),
    r(
      'mockReset clears calls history and resets callCount to 0',
      'spy.mockReset()',
      '{ callCount: 0, calls: [] }'
    ),
  ],

  'gql-query-variables-basics': [
    r(
      'Query parses and validates against GraphQL schema',
      'validateGraphql(testSchema, parseGraphql(userDoc))',
      '[] (zero validation errors)'
    ),
    r(
      'Executes GetProduct operation with required $id variable',
      'query GetProduct($id: ID!)',
      'Operation named GetProduct with variable $id: ID!'
    ),
    r(
      'Selects product title, price, inStock, and nested category fields',
      'graphql({ variableValues: { id: "prod_42" } })',
      '{ data: { product: { id: "prod_42", title: "Trail Runner Pro", price: 129.99, inStock: true, category: { id: "cat_footwear", name: "Footwear" } } } }'
    ),
    r(
      'Validates non-null ID variable requirement',
      'graphql({ variableValues: {} })',
      'validation error: variable $id of required type ID! was not provided'
    ),
  ],
};
