await (async () => {
  const userDoc = (typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  const testSchema = buildSchema(`
    type Query {
      product(id: ID!): Product
    }
    type Category {
      id: ID!
      name: String!
    }
    type Product {
      id: ID!
      title: String!
      price: Float!
      inStock: Boolean!
      category: Category!
    }
  `);

  const root = {
    product: ({ id }: { id: string }) => ({
      id,
      title: 'Trail Runner Pro',
      price: 129.99,
      inStock: true,
      category: { id: 'cat_footwear', name: 'Footwear' },
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

  const case1 = 'Query parses and validates against GraphQL schema';
  const case2 = 'Executes GetProduct operation with required $id variable';
  const case3 = 'Selects product title, price, inStock, and nested category fields';
  const case4 = 'Validates non-null ID variable requirement';

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

  // Case 2: Operation named GetProduct and declares $id
  $test.check(
    case2,
    op?.name?.value === 'GetProduct' && varNames.includes('id'),
    { operationName: op?.name?.value, variables: varNames }
  );

  // Case 3: Returns product and nested category
  const res3 = await runSafe({ id: 'prod_42' });
  const p = res3.data?.product;
  $test.check(
    case3,
    !res3.errors &&
      p?.id === 'prod_42' &&
      p?.title === 'Trail Runner Pro' &&
      p?.price === 129.99 &&
      p?.inStock === true &&
      p?.category?.id === 'cat_footwear' &&
      p?.category?.name === 'Footwear',
    { data: res3.data, errors: res3.errors }
  );

  // Case 4: Missing required $id variable returns validation error
  const res4 = await runSafe({});
  $test.check(
    case4,
    Boolean(res4.errors && res4.errors.length > 0),
    { errors: res4.errors }
  );
})();
