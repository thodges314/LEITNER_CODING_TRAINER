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
};
