await (async () => {
  const userDoc = (typeof schema === 'string' ? schema : typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  let parsedSchema = null;
  try {
    parsedSchema = buildSchema(userDoc + '\ntype Query { _dummy: String }\n');
  } catch (e) {
    parsedSchema = null;
  }

  // Case 1: Schema parses without SDL syntax errors
  $test.check('SDL parses successfully into valid GraphQL schema', parsedSchema !== null, parsedSchema);

  // Case 2: enum Role defines ADMIN, MEMBER, GUEST
  const roleType = parsedSchema?.getType('Role');
  const roleValues = roleType?.getValues?.()?.map((v) => v.name) || [];
  $test.check(
    'enum Role defines ADMIN, MEMBER, GUEST',
    $test.equal(roleValues.sort(), ['ADMIN', 'GUEST', 'MEMBER']),
    roleValues
  );

  // Case 3: directive @auth defines requires: Role = ADMIN on FIELD_DEFINITION
  const authDir = parsedSchema?.getDirective('auth');
  const authLocations = authDir?.locations || [];
  const requiresArg = authDir?.args?.find((a) => a.name === 'requires');
  const defaultVal =
    requiresArg?.defaultValue ??
    requiresArg?.astNode?.defaultValue?.value ??
    requiresArg?.default?.literal?.value;
  const hasAuthValid = Boolean(
    authDir &&
    authLocations.includes('FIELD_DEFINITION') &&
    requiresArg?.type?.toString() === 'Role' &&
    defaultVal === 'ADMIN'
  );
  $test.check(
    'directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION is defined',
    hasAuthValid,
    { authLocations, argType: requiresArg?.type?.toString(), defaultVal }
  );

  // Case 4: interfaces Node and Timestamped define required fields
  const nodeType = parsedSchema?.getType('Node');
  const timestampedType = parsedSchema?.getType('Timestamped');
  const nodeFields = nodeType?.getFields?.();
  const tsFields = timestampedType?.getFields?.();
  const hasInterfacesValid = Boolean(
    nodeFields?.id?.type?.toString() === 'ID!' &&
    tsFields?.createdAt?.type?.toString() === 'String!' &&
    tsFields?.updatedAt?.type?.toString() === 'String'
  );
  $test.check(
    'interfaces Node (id: ID!) and Timestamped (createdAt: String!, updatedAt: String) defined',
    hasInterfacesValid,
    { nodeFields, tsFields }
  );

  // Case 5: type Article implements Node & Timestamped and tags secretNotes with @auth(requires: ADMIN)
  const articleType = parsedSchema?.getType('Article');
  const ifaceNames = articleType?.getInterfaces?.()?.map((i) => i.name) || [];
  const artFields = articleType?.getFields?.();
  const secretDir = artFields?.secretNotes?.astNode?.directives?.find((d) => d.name?.value === 'auth');
  const secretDirArg = secretDir?.arguments?.find((a) => a.name?.value === 'requires');
  const hasArticleValid = Boolean(
    ifaceNames.includes('Node') &&
    ifaceNames.includes('Timestamped') &&
    artFields?.id?.type?.toString() === 'ID!' &&
    artFields?.title?.type?.toString() === 'String!' &&
    artFields?.secretNotes?.type?.toString() === 'String' &&
    artFields?.createdAt?.type?.toString() === 'String!' &&
    artFields?.updatedAt?.type?.toString() === 'String' &&
    secretDir &&
    secretDirArg?.value?.value === 'ADMIN'
  );
  $test.check(
    'type Article implements Node & Timestamped with secretNotes tagged with @auth(requires: ADMIN)',
    hasArticleValid,
    { ifaceNames, artFields }
  );
})();

