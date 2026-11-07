import { c } from './part1.mjs';

const part54 = {
  'graphql-normalized-cache': [
    c(
      'Normalizes simple entity and reconstructs tree',
      `const cache = createNormalizedCache();
cache.write({ user: { __typename: 'User', id: 'u1', name: 'Alice' } });
cache.read('user')`,
      `({ __typename: 'User', id: 'u1', name: 'Alice' })`
    ),
    c(
      'Merges fields into existing normalized records',
      `const cache = createNormalizedCache();
cache.write({ user: { __typename: 'User', id: 'u1', name: 'Alice', role: 'admin' } });
cache.write({ user: { __typename: 'User', id: 'u1', email: 'alice@example.com' } });
const inspected = cache.inspect();
[inspected['User:u1'].name, inspected['User:u1'].role, inspected['User:u1'].email]`,
      `['Alice', 'admin', 'alice@example.com']`
    ),
    c(
      'Normalizes array of entities into references and denormalizes on read',
      `const cache = createNormalizedCache();
cache.write({
  posts: [
    { __typename: 'Post', id: 10, title: 'Intro' },
    { __typename: 'Post', id: 20, title: 'Deep Dive' },
  ],
});
const inspected = cache.inspect();
const readPosts = cache.read('posts');
[inspected.ROOT_QUERY.posts, readPosts.map(p => p.title)]`,
      `[[{ __ref: 'Post:10' }, { __ref: 'Post:20' }], ['Intro', 'Deep Dive']]`
    ),
    c(
      'Normalizes nested relational entities with embedded value objects',
      `const cache = createNormalizedCache();
cache.write({
  post: {
    __typename: 'Post',
    id: 99,
    title: 'GraphQL',
    meta: { views: 50 },
    author: { __typename: 'User', id: 'u1', name: 'Alice' },
  },
});
const post = cache.read('post');
[post.meta.views, post.author.name, cache.inspect()['Post:99'].author]`,
      `[50, 'Alice', { __ref: 'User:u1' }]`
    ),
    c(
      'Returns null for missing rootKey',
      `const cache = createNormalizedCache();
cache.write({ a: 1 });
cache.read('nonExistent')`,
      `null`
    ),
    c(
      'Does not extract objects lacking __typename or id as identifiable entities',
      `const cache = createNormalizedCache();
cache.write({
  partial1: { __typename: 'User', name: 'NoId' },
  partial2: { id: 123, name: 'NoType' },
});
const inspected = cache.inspect();
['User:undefined' in inspected, 'undefined:123' in inspected, cache.read('partial1').name]`,
      `[false, false, 'NoId']`
    ),
  ],

  'graphql-optimistic-cache': [
    c(
      'Applies optimistic patch synchronously before mutation resolves',
      `const store = createOptimisticStore({ 'Todo:1': { id: 1, title: 'Task', done: false } });
let resolveMutation;
const pendingPromise = new Promise((res) => { resolveMutation = res; });
store.mutate({
  optimisticResponse: { 'Todo:1': { done: true } },
  mutationPromise: pendingPromise,
});
const immediate = store.get('Todo:1').done;
resolveMutation({ 'Todo:1': { done: true } });
immediate`,
      `true`
    ),
    c(
      'Overwrites optimistic response with authoritative server data on resolution',
      `const store = createOptimisticStore({ 'Todo:1': { id: 1, title: 'Task', done: false } });
await store.mutate({
  optimisticResponse: { 'Todo:1': { done: true } },
  mutationPromise: Promise.resolve({ 'Todo:1': { done: true, version: 2 } }),
});
store.get('Todo:1')`,
      `({ id: 1, title: 'Task', done: true, version: 2 })`
    ),
    c(
      'Reverts affected keys to pre-mutation checkpoint on mutation failure',
      `const store = createOptimisticStore({ 'Todo:2': { id: 2, title: 'Buy milk', done: false } });
let errorCaught = false;
try {
  await store.mutate({
    optimisticResponse: { 'Todo:2': { done: true } },
    mutationPromise: Promise.reject(new Error('Network error')),
  });
} catch (e) {
  errorCaught = true;
}
[errorCaught, store.get('Todo:2').done]`,
      `[true, false]`
    ),
    c(
      'Deletes newly added entity on mutation rollback',
      `const store = createOptimisticStore({});
try {
  await store.mutate({
    optimisticResponse: { 'Todo:new': { id: 'new', title: 'New task' } },
    mutationPromise: Promise.reject(new Error('Unauthorized')),
  });
} catch {}
store.get('Todo:new')`,
      `undefined`
    ),
    c(
      'Handles concurrent mutations on independent keys cleanly',
      `const store = createOptimisticStore({
  'Item:1': { count: 0 },
  'Item:2': { count: 0 },
});
const m1 = store.mutate({
  optimisticResponse: { 'Item:1': { count: 1 } },
  mutationPromise: Promise.resolve({ 'Item:1': { count: 10 } }),
});
const m2 = store.mutate({
  optimisticResponse: { 'Item:2': { count: 1 } },
  mutationPromise: Promise.reject(new Error('Fail')),
}).catch(() => {});
await Promise.all([m1, m2]);
[store.get('Item:1').count, store.get('Item:2').count]`,
      `[10, 0]`
    ),
    c(
      'Handles primitive and null values in store and rollback',
      `const store = createOptimisticStore({ 'Flag:1': true, 'Count:1': 0 });
try {
  await store.mutate({
    optimisticResponse: { 'Flag:1': false, 'Count:1': 5 },
    mutationPromise: Promise.reject(new Error('Abort')),
  });
} catch {}
[store.get('Flag:1'), store.get('Count:1')]`,
      `[true, 0]`
    ),
  ],

  'graphql-relay-pagination-merger': [
    c(
      'Appends incoming edges and updates pageInfo',
      `const existing = {
  edges: [{ cursor: 'c1', node: { id: 1, name: 'A' } }],
  pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: 'c1', endCursor: 'c1' },
};
const incoming = {
  edges: [{ cursor: 'c2', node: { id: 2, name: 'B' } }],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: 'c2', endCursor: 'c2' },
};
const merged = mergeRelayConnections(existing, incoming);
[merged.edges.map(e => e.cursor), merged.pageInfo.hasNextPage, merged.pageInfo.endCursor]`,
      `[['c1', 'c2'], false, 'c2']`
    ),
    c(
      'Deduplicates overlapping edges by cursor or id taking incoming data',
      `const existing = {
  edges: [
    { cursor: 'c1', node: { id: 1, name: 'Old A' } },
    { cursor: 'c2', node: { id: 2, name: 'B' } },
  ],
  pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: 'c1', endCursor: 'c2' },
};
const incoming = {
  edges: [
    { cursor: 'c1', node: { id: 1, name: 'New A' } },
    { cursor: 'c3', node: { id: 3, name: 'C' } },
  ],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: 'c1', endCursor: 'c3' },
};
const merged = mergeRelayConnections(existing, incoming);
[merged.edges.map(e => e.node.name), merged.edges.length]`,
      `[['B', 'New A', 'C'], 3]`
    ),
    c(
      'Prepends incoming edges in backward pagination',
      `const existing = {
  edges: [{ cursor: 'c2', node: { id: 2, name: 'B' } }],
  pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: 'c2', endCursor: 'c2' },
};
const incoming = {
  edges: [{ cursor: 'c1', node: { id: 1, name: 'A' } }],
  pageInfo: { hasNextPage: false, hasPreviousPage: true, startCursor: 'c1', endCursor: 'c1' },
};
const merged = mergeRelayConnections(existing, incoming, 'prepend');
[merged.edges.map(e => e.cursor), merged.pageInfo.startCursor, merged.pageInfo.hasNextPage, merged.pageInfo.hasPreviousPage]`,
      `[['c1', 'c2'], 'c1', true, true]`
    ),
    c(
      'Handles null existing connection gracefully',
      `const incoming = {
  edges: [{ cursor: 'c1', node: { id: 1 } }],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: 'c1', endCursor: 'c1' },
  totalCount: 1,
};
const merged = mergeRelayConnections(null, incoming);
[merged.edges.length, merged.totalCount]`,
      `[1, 1]`
    ),
    c(
      'Preserves existing totalCount if incoming totalCount is omitted',
      `const existing = {
  edges: [{ cursor: 'c1', node: { id: 1 } }],
  pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: 'c1', endCursor: 'c1' },
  totalCount: 100,
};
const incoming = {
  edges: [{ cursor: 'c2', node: { id: 2 } }],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: 'c2', endCursor: 'c2' },
};
mergeRelayConnections(existing, incoming).totalCount`,
      `100`
    ),
    c(
      'Returns null cursors and correct pageInfo when merged edges are empty',
      `const existing = {
  edges: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
};
const incoming = {
  edges: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
};
const merged = mergeRelayConnections(existing, incoming);
[merged.edges.length, merged.pageInfo.startCursor, merged.pageInfo.endCursor]`,
      `[0, null, null]`
    ),
  ],
};

export default part54;
