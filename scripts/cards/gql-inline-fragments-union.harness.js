await (async () => {
  const userDoc = (typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  const testSchema = buildSchema(`
    union SearchResult = User | Issue | Comment

    type User {
      id: ID!
      username: String!
      avatarUrl: String
    }

    type Issue {
      id: ID!
      title: String!
      status: String!
    }

    type Comment {
      id: ID!
      body: String!
      author: User!
    }

    type Query {
      search(term: String!): [SearchResult!]!
    }
  `);

  const mockItems = [
    { __typename: 'User', id: 'u1', username: 'alice', avatarUrl: 'https://img.com/u1.png' },
    { __typename: 'Issue', id: 'i1', title: 'Fix CSS bug', status: 'OPEN' },
    { __typename: 'Comment', id: 'c1', body: 'LGTM!', author: { id: 'u2', username: 'bob', avatarUrl: null } },
  ];

  const root = {
    search: ({ term }) => mockItems.filter(() => Boolean(term)),
  };

  async function runSafe(vars) {
    try {
      const res = await graphql({ schema: testSchema, source: userDoc, rootValue: root, variableValues: vars });
      return res;
    } catch (e) {
      return { errors: [e] };
    }
  }

  const r1 = await runSafe({ term: 'test' });
  const items = r1.data?.search || [];
  const userResult = items.find((x) => x.__typename === 'User');
  const issueResult = items.find((x) => x.__typename === 'Issue');
  const commentResult = items.find((x) => x.__typename === 'Comment');

  // Case 1: Selects __typename on union items
  $test.check(
    'Executes query and selects __typename on all union results',
    !r1.errors && items.length === 3 && items.every((x) => typeof x.__typename === 'string'),
    r1
  );

  // Case 2: Selects User fields via inline fragment
  $test.check(
    'Selects User fields (id, username, avatarUrl) using inline fragment',
    !r1.errors && userResult?.id === 'u1' && userResult?.username === 'alice' && userResult?.avatarUrl === 'https://img.com/u1.png',
    userResult
  );

  // Case 3: Selects Issue fields via inline fragment
  $test.check(
    'Selects Issue fields (id, title, status) using inline fragment',
    !r1.errors && issueResult?.id === 'i1' && issueResult?.title === 'Fix CSS bug' && issueResult?.status === 'OPEN',
    issueResult
  );

  // Case 4: Selects Comment fields with nested author via inline fragment
  $test.check(
    'Selects Comment fields (id, body, author.username) using inline fragment',
    !r1.errors && commentResult?.id === 'c1' && commentResult?.body === 'LGTM!' && commentResult?.author?.username === 'bob',
    commentResult
  );

  // Case 5: Contains inline fragments with type conditions on User, Issue, and Comment
  const hasUserFrag = /\.\.\.\s*on\s+User\b/.test(userDoc);
  const hasIssueFrag = /\.\.\.\s*on\s+Issue\b/.test(userDoc);
  const hasCommentFrag = /\.\.\.\s*on\s+Comment\b/.test(userDoc);
  $test.check(
    'Contains inline fragments with type conditions on User, Issue, and Comment',
    hasUserFrag && hasIssueFrag && hasCommentFrag,
    userDoc
  );
})();

