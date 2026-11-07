await (async () => {
  const userDoc = (typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  const testSchema = buildSchema(`
    enum Priority {
      LOW
      NORMAL
      HIGH
      URGENT
    }

    type User {
      id: ID!
      username: String!
      status: String!
    }

    type Message {
      id: ID!
      content: String!
      priority: Priority!
      createdAt: String!
      author: User!
    }

    type Query {
      _dummy: String
    }

    type Subscription {
      messageCreated(channelId: ID!, minPriority: Priority): Message!
    }
  `);

  let ast = null;
  let parseErr = null;
  try {
    ast = parseGraphql(userDoc);
  } catch (e) {
    parseErr = e;
  }

  // Case 1: Parses and validates cleanly against subscription schema
  const validationErrors = ast ? validateGraphql(testSchema, ast) : [parseErr];
  $test.check(
    'Document parses and validates cleanly against subscription schema',
    ast !== null && validationErrors.length === 0,
    validationErrors
  );

  const op = ast?.definitions?.find((d) => d.kind === 'OperationDefinition');

  // Case 2: Named subscription OnMessageCreated
  $test.check(
    'Defines operation as subscription OnMessageCreated',
    op?.operation === 'subscription' && op?.name?.value === 'OnMessageCreated',
    op?.name?.value
  );

  // Case 3: Variable definitions for $channelId: ID! and optional $minPriority: Priority
  const varDefs = op?.variableDefinitions || [];
  const channelVar = varDefs.find((v) => v.variable?.name?.value === 'channelId');
  const priorityVar = varDefs.find((v) => v.variable?.name?.value === 'minPriority');
  const hasValidVars = Boolean(
    channelVar?.type?.kind === 'NonNullType' &&
    channelVar?.type?.type?.name?.value === 'ID' &&
    priorityVar?.type?.kind === 'NamedType' &&
    priorityVar?.type?.name?.value === 'Priority'
  );
  $test.check(
    'Accepts $channelId: ID! and $minPriority: Priority variable definitions',
    hasValidVars,
    varDefs
  );

  // Case 4: Field arguments for messageCreated(channelId: $channelId, minPriority: $minPriority)
  const rootField = op?.selectionSet?.selections?.find((s) => s.name?.value === 'messageCreated');
  const channelArg = rootField?.arguments?.find((a) => a.name?.value === 'channelId');
  const priorityArg = rootField?.arguments?.find((a) => a.name?.value === 'minPriority');
  const hasValidArgs = Boolean(
    channelArg?.value?.kind === 'Variable' &&
    channelArg?.value?.name?.value === 'channelId' &&
    priorityArg?.value?.kind === 'Variable' &&
    priorityArg?.value?.name?.value === 'minPriority'
  );
  $test.check(
    'Passes channelId: $channelId and minPriority: $minPriority to messageCreated',
    hasValidArgs,
    rootField?.arguments
  );

  // Case 5: Selects message payload fields with nested author
  const selections = rootField?.selectionSet?.selections || [];
  const fieldNames = selections.map((s) => s.name?.value);
  const authorField = selections.find((s) => s.name?.value === 'author');
  const authorSubfields = authorField?.selectionSet?.selections?.map((s) => s.name?.value) || [];
  const hasPayload = Boolean(
    fieldNames.includes('id') &&
    fieldNames.includes('content') &&
    fieldNames.includes('priority') &&
    fieldNames.includes('createdAt') &&
    authorSubfields.includes('id') &&
    authorSubfields.includes('username') &&
    authorSubfields.includes('status')
  );
  $test.check(
    'Selects message fields (id, content, priority, createdAt) and author (id, username, status)',
    hasPayload,
    { fieldNames, authorSubfields }
  );
})();

