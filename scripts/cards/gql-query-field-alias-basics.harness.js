await (async () => {
  const userDoc = (typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  const testSchema = buildSchema(`
    type Query {
      user(id: ID!): User
    }
    type User {
      id: ID!
      username: String!
      avatarUrl(size: Int!): String!
    }
  `);

  const root = {
    user: ({ id }: { id: string }) => ({
      id,
      username: 'codemaster',
      avatarUrl: ({ size }: { size: number }) => `https://cdn.example.com/avatars/${id}_${size}.png`,
    }),
  };

  async function runSafe(vars: Record<string, unknown>) {
    try {
      const res = await graphql({
        schema: testSchema,
        source: userDoc,
        rootValue: root,
        variableValues: vars,
      });
      return res;
    } catch (e) {
      return { errors: [e] };
    }
  }

  const case1 = 'Query parses and validates against avatar GraphQL schema';
  const case2 = 'Defines named query GetUserAvatars with required $id variable';
  const case3 = 'Queries user with thumb and hero field aliases with size arguments';
  const case4 = 'Returns distinct URLs mapped to alias keys in result data';

  if (!userDoc) {
    $test.check(case1, false, { error: 'Empty query document' });
    $test.check(case2, false, { error: 'Empty query document' });
    $test.check(case3, false, { error: 'Empty query document' });
    $test.check(case4, false, { error: 'Empty query document' });
    return;
  }

  let parsed: any;
  try {
    parsed = parseGraphql(userDoc);
  } catch (err: any) {
    $test.check(case1, false, { error: err?.message });
    $test.check(case2, false, { error: 'Parse failed' });
    $test.check(case3, false, { error: 'Parse failed' });
    $test.check(case4, false, { error: 'Parse failed' });
    return;
  }

  const errors = validateGraphql(testSchema, parsed);
  $test.check(case1, errors.length === 0, { errors: errors.map((e: any) => e.message) });

  const op = parsed.definitions?.find((d: any) => d.kind === 'OperationDefinition');
  const varNames = (op?.variableDefinitions || []).map((v: any) => v.variable?.name?.value);

  // Case 2: Named query GetUserAvatars with $id
  $test.check(
    case2,
    op?.name?.value === 'GetUserAvatars' && varNames.includes('id'),
    { operationName: op?.name?.value, variables: varNames }
  );

  // Case 3: Verify thumb and hero alias regex or AST
  const hasThumb = /thumb\s*:\s*avatarUrl\b/.test(userDoc);
  const hasHero = /hero\s*:\s*avatarUrl\b/.test(userDoc);
  $test.check(case3, hasThumb && hasHero, { hasThumb, hasHero, query: userDoc });

  // Case 4: Execute query and check distinct URLs on alias keys
  const res = await runSafe({ id: 'user_42' });
  const u = res.data?.user;
  $test.check(
    case4,
    !res.errors &&
      u?.id === 'user_42' &&
      u?.username === 'codemaster' &&
      u?.thumb === 'https://cdn.example.com/avatars/user_42_64.png' &&
      u?.hero === 'https://cdn.example.com/avatars/user_42_512.png',
    res
  );
})();

