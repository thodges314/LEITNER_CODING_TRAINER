import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by GraphQL harness', ...o });

export default {
  'gql-inline-fragments-union': [
    r(
      'Executes query and selects __typename on all union results',
      'query SearchFeed($term: String!)',
      'returns union results with __typename discriminant'
    ),
    r(
      'Selects User fields (id, username, avatarUrl) using inline fragment',
      '... on User { id username avatarUrl }',
      'resolves concrete User fields'
    ),
    r(
      'Selects Issue fields (id, title, status) using inline fragment',
      '... on Issue { id title status }',
      'resolves concrete Issue fields'
    ),
    r(
      'Selects Comment fields (id, body, author.username) using inline fragment',
      '... on Comment { id body author { username } }',
      'resolves concrete Comment fields and nested author username'
    ),
    r(
      'Contains inline fragments with type conditions on User, Issue, and Comment',
      '... on User, ... on Issue, ... on Comment',
      'includes type condition spreads for all three union members'
    ),
  ],

  'gql-subscription-document': [
    r(
      'Document parses and validates cleanly against subscription schema',
      'subscription document source',
      'validates against GraphQL subscription schema without errors'
    ),
    r(
      'Defines operation as subscription OnMessageCreated',
      'subscription OnMessageCreated(...)',
      'operation is named OnMessageCreated of type subscription'
    ),
    r(
      'Accepts $channelId: ID! and $minPriority: Priority variable definitions',
      '($channelId: ID!, $minPriority: Priority)',
      'declares required $channelId and optional $minPriority variables'
    ),
    r(
      'Passes channelId: $channelId and minPriority: $minPriority to messageCreated',
      'messageCreated(channelId: $channelId, minPriority: $minPriority)',
      'passes variables to field arguments'
    ),
    r(
      'Selects message fields (id, content, priority, createdAt) and author (id, username, status)',
      'messageCreated { id content priority createdAt author { id username status } }',
      'selects all message fields and nested author details'
    ),
  ],

  'gql-schema-sdl-interfaces-directives': [
    r(
      'SDL parses successfully into valid GraphQL schema',
      'schema SDL definition',
      'parses cleanly via buildSchema'
    ),
    r(
      'enum Role defines ADMIN, MEMBER, GUEST',
      'enum Role',
      'contains exact ADMIN, MEMBER, GUEST values'
    ),
    r(
      'directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION is defined',
      'directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION',
      'defines directive on FIELD_DEFINITION with default ADMIN'
    ),
    r(
      'interfaces Node (id: ID!) and Timestamped (createdAt: String!, updatedAt: String) defined',
      'interface Node, interface Timestamped',
      'defines contract interfaces with required fields'
    ),
    r(
      'type Article implements Node & Timestamped with secretNotes tagged with @auth(requires: ADMIN)',
      'type Article implements Node & Timestamped',
      'implements both interfaces and applies @auth(requires: ADMIN) directive'
    ),
  ],
};

