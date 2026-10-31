import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the GraphQL harness', ...o });

export default {
  'graphql-mini-client': [
    r(
      'Sends POST request with query and variables in JSON body',
      "fetchGraphQL('/graphql', 'query { viewer { name } }', { limit: 10 })",
      "POST with Content-Type: application/json; body has { query, variables }; returns data { viewer: { name: 'Alice' } }",
      { callSignature: "fetchGraphQL('/graphql', query, variables)" }
    ),
    r(
      'Merges custom headers into request',
      "fetchGraphQL('/graphql', 'query { count }', undefined, { 'Authorization': 'Bearer token-xyz' })",
      "headers include Authorization: Bearer token-xyz and Content-Type: application/json; returns data { count: 42 }",
      { callSignature: "fetchGraphQL('/graphql', query, undefined, headers)" }
    ),
    r(
      'Returns data when errors array is empty',
      "fetchGraphQL('/graphql', 'query { active }')  // payload has { data: { active: true }, errors: [] }",
      "returns data { active: true } without throwing",
      { callSignature: "fetchGraphQL('/graphql', query)" }
    ),
    r(
      'Throws an error if response.ok is false',
      "fetchGraphQL('/graphql', query)  // response status 500",
      "rejects with Error containing status code 500",
      { callSignature: "fetchGraphQL('/graphql', query)" }
    ),
    r(
      'Throws an error if GraphQL errors are returned in payload',
      "fetchGraphQL('/graphql', query)  // payload contains { errors: [{ message: 'Field not found' }] }",
      "rejects with Error containing GraphQL error message 'Field not found'",
      { callSignature: "fetchGraphQL('/graphql', query)" }
    ),
    r(
      'Propagates network errors if fetch rejects',
      "fetchGraphQL('/graphql', query)  // fetch rejects TypeError('Failed to fetch')",
      "rejects with the original TypeError: Failed to fetch",
      { callSignature: "fetchGraphQL('/graphql', query)" }
    ),
  ],

  'graphql-extract-operation-name': [
    c(
      'Extracts operation name from a named query',
      "getOperationName('query GetUserProfile { user { id name } }')",
      "'GetUserProfile'"
    ),
    c(
      'Extracts operation name from a named mutation with variables',
      "getOperationName('mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) { id } }')",
      "'CreateOrder'"
    ),
    c(
      'Extracts operation name from a named subscription',
      "getOperationName('subscription OnCommentAdded($repoId: ID!) { commentAdded(repoId: $repoId) { text } }')",
      "'OnCommentAdded'"
    ),
    c(
      'Ignores leading comments and whitespace',
      "getOperationName('# Fetches user\\n# Author: team-core\\n  query FetchActiveUser { activeUser { id } }')",
      "'FetchActiveUser'"
    ),
    c(
      'Returns null for anonymous shorthand query',
      "getOperationName('{ viewer { id } }')",
      'null'
    ),
    c(
      'Returns null for anonymous query with keyword',
      "getOperationName('query { viewer { id } }')",
      'null'
    ),
    c(
      'Returns null for empty or invalid input',
      "getOperationName('')",
      'null'
    ),
    c(
      'Returns null for non-string input',
      "getOperationName(123)",
      'null'
    ),
  ],

  'graphql-variable-validator': [
    c(
      'Returns valid when all required variables are supplied',
      "validateVariables({ id: 'ID!', filter: 'String' }, { id: 'usr_100', filter: 'active' })",
      '{ valid: true, missing: [] }'
    ),
    c(
      'Flags missing required variables in definition order',
      "validateVariables({ id: 'ID!', role: 'String!', limit: 'Int' }, { limit: 10 })",
      "{ valid: false, missing: ['id', 'role'] }"
    ),
    c(
      'Treats null or undefined values as missing for required fields',
      "validateVariables({ id: 'ID!', token: 'String!' }, { id: null, token: undefined })",
      "{ valid: false, missing: ['id', 'token'] }"
    ),
    c(
      'Treats falsy values (0, empty string, false) as validly provided',
      "validateVariables({ count: 'Int!', name: 'String!', active: 'Boolean!' }, { count: 0, name: '', active: false })",
      '{ valid: true, missing: [] }'
    ),
    c(
      'Allows optional variables to be omitted without error',
      "validateVariables({ offset: 'Int', limit: 'Int' }, {})",
      '{ valid: true, missing: [] }'
    ),
    c(
      'Handles omitted or null variables object by marking all required as missing',
      "validateVariables({ requiredA: 'String!', optionalB: 'Int' })",
      "{ valid: false, missing: ['requiredA'] }"
    ),
  ],

  'graphql-sdl-type-generator': [
    c(
      'Formats single object type with scalar fields and required markers',
      "generateTypeDefs([{ name: 'User', fields: [{ name: 'id', type: 'ID', required: true }, { name: 'email', type: 'String', required: true }, { name: 'age', type: 'Int' }] }])",
      `"type User {\\n  id: ID!\\n  email: String!\\n  age: Int\\n}"`
    ),
    c(
      'Formats list fields with both item and list nullability combinations',
      "generateTypeDefs([{ name: 'Post', fields: [{ name: 'tags', type: 'String', isArray: true }, { name: 'authors', type: 'User', isArray: true, itemRequired: true }, { name: 'comments', type: 'Comment', isArray: true, itemRequired: true, required: true }] }])",
      `"type Post {\\n  tags: [String]\\n  authors: [User!]\\n  comments: [Comment!]!\\n}"`
    ),
    c(
      'Prepends docstring description when provided',
      "generateTypeDefs([{ name: 'Viewer', description: 'Active authenticated session', fields: [{ name: 'id', type: 'ID', required: true }] }])",
      `'"""Active authenticated session"""\\ntype Viewer {\\n  id: ID!\\n}'`
    ),
    c(
      'Joins multiple type definitions with double newlines',
      "generateTypeDefs([{ name: 'A', fields: [{ name: 'id', type: 'ID' }] }, { name: 'B', fields: [{ name: 'id', type: 'ID' }] }])",
      `"type A {\\n  id: ID\\n}\\n\\ntype B {\\n  id: ID\\n}"`
    ),
    c(
      'Returns empty string for empty models array or non-array input',
      "generateTypeDefs([])",
      "''"
    ),
    c(
      'Returns empty string when input is null or undefined',
      "generateTypeDefs(null)",
      "''"
    ),
  ],

  'graphql-input-object-sanitizer': [
    c(
      'Sanitizes valid inputs and strips undeclared extra fields',
      "sanitizeInput({ name: { type: 'String', required: true }, age: { type: 'Int' } }, { name: 'Alice', age: 30, rogueField: 'ignored' })",
      "{ valid: true, data: { name: 'Alice', age: 30 } }"
    ),
    c(
      'Flags missing required fields with error messages preserving definition order',
      "sanitizeInput({ first: { type: 'String', required: true }, second: { type: 'String', required: true } }, {})",
      "{ valid: false, errors: [\"Field 'first' is required\", \"Field 'second' is required\"] }"
    ),
    c(
      'Validates scalar types: String, Int, Float, Boolean, ID',
      "sanitizeInput({ intVal: { type: 'Int' }, floatVal: { type: 'Float' }, boolVal: { type: 'Boolean' }, idVal: { type: 'ID' } }, { intVal: 3.14, floatVal: 'not-a-float', boolVal: 'true', idVal: {} })",
      "{ valid: false, errors: [\"Field 'intVal' must be of type Int\", \"Field 'floatVal' must be of type Float\", \"Field 'boolVal' must be of type Boolean\", \"Field 'idVal' must be of type ID\"] }"
    ),
    c(
      'Validates Float rejects non-finite numbers like Infinity',
      "sanitizeInput({ amount: { type: 'Float' } }, { amount: Infinity })",
      "{ valid: false, errors: [\"Field 'amount' must be of type Float\"] }"
    ),
    c(
      'Enforces enumValues constraints on input fields in declaration order',
      "sanitizeInput({ r1: { type: 'String', enumValues: ['A'] }, r2: { type: 'String', enumValues: ['B'] } }, { r1: 'X', r2: 'Y' })",
      "{ valid: false, errors: [\"Field 'r1' must be one of: A\", \"Field 'r2' must be one of: B\"] }"
    ),
    c(
      'Allows optional fields to be omitted without generating errors',
      "sanitizeInput({ title: { type: 'String', required: true }, subtitle: { type: 'String' } }, { title: 'Hello World' })",
      "{ valid: true, data: { title: 'Hello World' } }"
    ),
  ],

  'graphql-discriminated-union-resolver': [
    c(
      'Resolves type using custom predicates when __typename is absent',
      "const resolve = createTypeResolver({ User: (v) => Boolean(v.email), Product: (v) => Boolean(v.sku) });\n[resolve({ email: 'a@b.com' }), resolve({ sku: 'P-100' })]",
      "['User', 'Product']"
    ),
    c(
      'Short-circuits immediately when explicit __typename is already present',
      "const resolve = createTypeResolver({ User: () => true });\nresolve({ __typename: 'SpecialOverride', email: 'a@b.com' })",
      "'SpecialOverride'"
    ),
    c(
      'Respects predicate order when evaluating ambiguous inputs',
      "const resolve = createTypeResolver({ First: () => true, Second: () => true });\nresolve({ test: 1 })",
      "'First'"
    ),
    c(
      'Returns null when no predicate matches or value is non-object',
      "const resolve = createTypeResolver({ User: (v) => Boolean(v.email) });\n[resolve({ unknown: 1 }), resolve(null), resolve('not an object')]",
      '[null, null, null]'
    ),
  ],

  'graphql-nested-field-resolvers': [
    c(
      'Query.authors and Query.books call db.getAuthors and db.getBooks',
      "const res = createLibraryResolvers();\nconst ctx = { db: { getAuthors: () => [{ id: '1', name: 'Alice' }], getBooks: () => [{ id: 'b1', title: 'Book 1', authorId: '1' }] } };\n[res.Query.authors(null, {}, ctx), res.Query.books(null, {}, ctx)]",
      "[[{ id: '1', name: 'Alice' }], [{ id: 'b1', title: 'Book 1', authorId: '1' }]]"
    ),
    c(
      'Query.author passes args.id to db.getAuthorById',
      "const res = createLibraryResolvers();\nconst ctx = { db: { getAuthorById: (id) => id === '42' ? { id: '42', name: 'Douglas' } : null } };\n[res.Query.author(null, { id: '42' }, ctx), res.Query.author(null, { id: '99' }, ctx)]",
      "[{ id: '42', name: 'Douglas' }, null]"
    ),
    c(
      'Author.books passes parent.id to db.getBooksByAuthorId',
      "const res = createLibraryResolvers();\nconst ctx = { db: { getBooksByAuthorId: (id) => [{ id: 'b_' + id, authorId: id }] } };\nres.Author.books({ id: 'auth_7', name: 'Seven' }, {}, ctx)",
      "[{ id: 'b_auth_7', authorId: 'auth_7' }]"
    ),
    c(
      'Book.author passes parent.authorId to db.getAuthorById',
      "const res = createLibraryResolvers();\nconst ctx = { db: { getAuthorById: (id) => ({ id, name: 'Author of ' + id }) } };\nres.Book.author({ id: 'b1', title: 'Book 1', authorId: 'auth_99' }, {}, ctx)",
      "{ id: 'auth_99', name: 'Author of auth_99' }"
    ),
  ],

  'graphql-context-auth-guard': [
    c(
      'Allows authenticated user without role restriction and passes resolver arguments through',
      "const guard = withAuth((p, a, c, i) => ({ p, a, userId: c.user.id, i }));\nguard('parentVal', { key: 'val' }, { user: { id: 'u1' } }, 'infoVal')",
      "{ p: 'parentVal', a: { key: 'val' }, userId: 'u1', i: 'infoVal' }"
    ),
    c(
      'Throws UNAUTHENTICATED when context.user is missing or null',
      "const guard = withAuth(() => 'ok');\nconst err1 = (() => { try { guard(null, {}, {}); return 'no error'; } catch (e) { return e.message; } })();\nconst err2 = (() => { try { guard(null, {}, { user: null }); return 'no error'; } catch (e) { return e.message; } })();\n[err1, err2]",
      "['UNAUTHENTICATED', 'UNAUTHENTICATED']"
    ),
    c(
      'Allows access when user possesses at least one required role',
      "const guard = withAuth(() => 'authorized', ['admin', 'editor']);\nguard(null, {}, { user: { id: 'u1', roles: ['user', 'editor'] } })",
      "'authorized'"
    ),
    c(
      'Throws FORBIDDEN when user lacks any required role or has empty roles',
      "const guard = withAuth(() => 'authorized', ['admin', 'superadmin']);\nconst err1 = (() => { try { guard(null, {}, { user: { id: 'u1', roles: ['guest'] } }); return 'no error'; } catch (e) { return e.message; } })();\nconst err2 = (() => { try { guard(null, {}, { user: { id: 'u2', roles: [] } }); return 'no error'; } catch (e) { return e.message; } })();\nconst err3 = (() => { try { guard(null, {}, { user: { id: 'u3' } }); return 'no error'; } catch (e) { return e.message; } })();\n[err1, err2, err3]",
      "['FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN']"
    ),
    c(
      'Supports asynchronous resolvers returning a promise',
      "const guard = withAuth(async (p, a) => a.count * 2);\nawait guard(null, { count: 21 }, { user: { id: 'u1' } })",
      '42'
    ),
  ],

  'graphql-format-error-masking': [
    c(
      'Preserves message and extensions for all safe client error codes in production',
      "['BAD_USER_INPUT', 'UNAUTHENTICATED', 'FORBIDDEN', 'GRAPHQL_VALIDATION_FAILED'].map(code => maskAndFormatError({ message: 'safe message', locations: [{ line: 1, column: 2 }], path: ['field'], extensions: { code, custom: 123 } }, true))",
      "[{ message: 'safe message', locations: [{ line: 1, column: 2 }], path: ['field'], extensions: { code: 'BAD_USER_INPUT', custom: 123 } }, { message: 'safe message', locations: [{ line: 1, column: 2 }], path: ['field'], extensions: { code: 'UNAUTHENTICATED', custom: 123 } }, { message: 'safe message', locations: [{ line: 1, column: 2 }], path: ['field'], extensions: { code: 'FORBIDDEN', custom: 123 } }, { message: 'safe message', locations: [{ line: 1, column: 2 }], path: ['field'], extensions: { code: 'GRAPHQL_VALIDATION_FAILED', custom: 123 } }]"
    ),
    c(
      'Masks internal server error and strips sensitive extensions in production by default',
      "maskAndFormatError({ message: 'connection refused to pg://secret:5432', locations: [{ line: 10, column: 1 }], path: ['user'], extensions: { code: 'INTERNAL_SERVER_ERROR', stacktrace: ['line 1', 'line 2'], secret: 'pwd' } })",
      "{ message: 'Internal server error', locations: [{ line: 10, column: 1 }], path: ['user'], extensions: { code: 'INTERNAL_SERVER_ERROR' } }"
    ),
    c(
      'Masks unlisted / database error codes in production',
      "maskAndFormatError({ message: 'Deadlock found when trying to get lock', extensions: { code: 'DATABASE_DEADLOCK', table: 'users' } }, true)",
      "{ message: 'Internal server error', extensions: { code: 'INTERNAL_SERVER_ERROR' } }"
    ),
    c(
      'Preserves message and full extensions when isProduction is false',
      "maskAndFormatError({ message: 'syntax error in SQL query', extensions: { code: 'SQL_SYNTAX_ERROR', sql: 'SELECT * FROM secrets' } }, false)",
      "{ message: 'syntax error in SQL query', extensions: { code: 'SQL_SYNTAX_ERROR', sql: 'SELECT * FROM secrets' } }"
    ),
    c(
      'Defaults extensions.code to INTERNAL_SERVER_ERROR when omitted in dev mode',
      "maskAndFormatError({ message: 'Uncaught TypeError' }, false)",
      "{ message: 'Uncaught TypeError', extensions: { code: 'INTERNAL_SERVER_ERROR' } }"
    ),
  ],
};

