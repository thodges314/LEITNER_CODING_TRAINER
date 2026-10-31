await (async () => {
  const userDoc = (typeof schema === 'string' ? schema : typeof query === 'string' ? query : typeof solution === 'string' ? solution : '').trim();
  let parsedSchema = null;
  try {
    parsedSchema = buildSchema(userDoc + '\ntype Query { _dummy: String }\n');
  } catch (e) {
    parsedSchema = null;
  }

  // Case 1: Schema parses without syntax errors
  $test.check('SDL parses successfully into valid GraphQL schema', parsedSchema !== null, parsedSchema);

  // Case 2: enum TicketStatus has all 4 values
  const enumType = parsedSchema?.getType('TicketStatus');
  const enumValues = enumType?.getValues?.()?.map((v) => v.name) || [];
  $test.check('enum TicketStatus defines OPEN, IN_PROGRESS, RESOLVED, CLOSED', $test.equal(enumValues.sort(), ['CLOSED', 'IN_PROGRESS', 'OPEN', 'RESOLVED']), enumValues);

  // Case 3: union TaskItem unions Bug and Feature
  const unionType = parsedSchema?.getType('TaskItem');
  const unionMembers = unionType?.getTypes?.()?.map((t) => t.name) || [];
  $test.check('union TaskItem defines Bug | Feature', $test.equal(unionMembers.sort(), ['Bug', 'Feature']), unionMembers);

  // Case 4: type Project defines id: ID!, status: TicketStatus!, and tasks: [TaskItem!]!
  const projectType = parsedSchema?.getType('Project');
  const projectFields = projectType?.getFields?.();
  const hasProjectValid = Boolean(
    projectFields?.id?.type?.toString() === 'ID!' &&
    projectFields?.status?.type?.toString() === 'TicketStatus!' &&
    projectFields?.tasks?.type?.toString() === '[TaskItem!]!'
  );
  $test.check('type Project defines id: ID!, status: TicketStatus!, and tasks: [TaskItem!]!', hasProjectValid, projectFields);
})();
