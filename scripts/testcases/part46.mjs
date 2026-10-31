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
};
