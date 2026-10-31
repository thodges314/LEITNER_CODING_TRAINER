import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by GraphQL harness', ...o });

export default {
  'gql-query-nested-fields': [
    r(
      "Queries article by slug with nested author details",
      "query GetArticle($slug: String!)",
      "returns article with id, title, publishedAt, and nested author { id, name, avatarUrl }"
    ),
    r(
      "Limits comments to 3 and selects nested author name",
      "comments(limit: 3)",
      "returns exactly 3 comments with id, text, createdAt, and author { name }"
    ),
    r(
      "Defines named query GetArticle",
      "query GetArticle",
      "operation is named GetArticle"
    ),
    r(
      "Accepts non-null variable $slug: String!",
      "$slug: String!",
      "declares $slug as non-nullable String!"
    ),
  ],

  'gql-query-aliases-fragments': [
    r(
      "Queries primary alias with UserSummary fragment",
      "primary: user(id: $primaryId) { ...UserSummary }",
      "{ id: \"1\", name: \"Alice\", email: \"alice@example.com\", role: \"ADMIN\" }"
    ),
    r(
      "Queries secondary alias with UserSummary fragment",
      "secondary: user(id: $secondaryId) { ...UserSummary }",
      "{ id: \"2\", name: \"Bob\", email: \"bob@example.com\", role: \"MEMBER\" }"
    ),
    r(
      "Defines fragment UserSummary on User",
      "fragment UserSummary on User",
      "fragment specifies id, name, email, and role"
    ),
    r(
      "Spreads ...UserSummary into user selections",
      "...UserSummary",
      "fragment is spread on both user selections"
    ),
  ],

  'gql-query-variables-directives': [
    r(
      "Default variables include price and omit reviews",
      "{ id: \"p1\" }",
      "{ product: { id: \"p1\", name: \"Mechanical Keyboard\", price: 149.99 } }"
    ),
    r(
      "@include(if: $withReviews) includes reviews when true",
      "{ id: \"p1\", withReviews: true }",
      "reviews array is included with rating and comment"
    ),
    r(
      "@skip(if: $skipPricing) omits price when true",
      "{ id: \"p1\", skipPricing: true }",
      "price field is omitted from returned product"
    ),
    r(
      "Declares default values for $withReviews and $skipPricing",
      "operation header",
      "$withReviews: Boolean = false and $skipPricing: Boolean = false"
    ),
  ],

  'gql-query-pagination': [
    r(
      "Queries totalCount and pageInfo with hasNextPage and endCursor",
      "members(first: $first, after: $after) { totalCount pageInfo { ... } }",
      "returns totalCount: 42, hasNextPage: true, endCursor: \"cursor_2\""
    ),
    r(
      "Queries edges with cursor and node user details",
      "edges { cursor node { id name email } }",
      "returns edges with cursor and node { id: \"u1\", name: \"Alice\", email: \"alice@example.com\" }"
    ),
    r(
      "Defines named query GetProjectMembers",
      "query GetProjectMembers",
      "operation is named GetProjectMembers"
    ),
    r(
      "Sets default $first: Int! = 10 and optional $after: String",
      "operation header",
      "declares $first: Int! = 10 and $after: String"
    ),
  ],

  'gql-mutation-input-payload': [
    r(
      "Executes mutation and selects team fields (id, name, slug, memberCount)",
      "mutation CreateTeam($input: CreateTeamInput!) { createTeam(input: $input) { team { ... } } }",
      "returns created team { id: \"team_1\", name: \"Core Eng\", slug: \"core-eng\", memberCount: 1 }"
    ),
    r(
      "Selects userErrors array with field, message, and code",
      "userErrors { field message code }",
      "returns userErrors array with field, message, and code"
    ),
    r(
      "Defines named mutation CreateTeam",
      "mutation CreateTeam",
      "operation is named CreateTeam"
    ),
    r(
      "Accepts non-null variable $input: CreateTeamInput!",
      "$input: CreateTeamInput!",
      "declares $input as non-nullable CreateTeamInput!"
    ),
  ],

  'gql-schema-sdl-types': [
    r(
      "SDL parses successfully into valid GraphQL schema",
      "schema definition",
      "parses cleanly via buildSchema"
    ),
    r(
      "type User defines id: ID!, name: String!, email: String!, and posts: [Post!]!",
      "type User",
      "fields match specified types and [Post!]! non-null list"
    ),
    r(
      "type Post defines id: ID!, title: String!, published: Boolean!, and author: User!",
      "type Post",
      "fields match specified types and User! relation"
    ),
    r(
      "input CreatePostInput defines title: String!, authorId: ID!, published: Boolean = false",
      "input CreatePostInput",
      "input fields match types and defaultValue false"
    ),
  ],

  'gql-schema-sdl-enums-unions': [
    r(
      "SDL parses successfully into valid GraphQL schema",
      "schema definition",
      "parses cleanly via buildSchema"
    ),
    r(
      "enum TicketStatus defines OPEN, IN_PROGRESS, RESOLVED, CLOSED",
      "enum TicketStatus",
      "contains exact 4 enum members"
    ),
    r(
      "union TaskItem defines Bug | Feature",
      "union TaskItem",
      "unions Bug | Feature"
    ),
    r(
      "type Project defines id: ID!, status: TicketStatus!, and tasks: [TaskItem!]!",
      "type Project",
      "status is TicketStatus! and tasks is [TaskItem!]!"
    ),
  ],

};
