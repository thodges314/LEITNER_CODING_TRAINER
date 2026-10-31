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

  // Case 2: User type has non-null scalar fields and non-null list of non-null posts [Post!]!
  const userType = parsedSchema?.getType('User');
  const userFields = userType?.getFields?.();
  const hasUserValid = Boolean(
    userFields?.id?.type?.toString() === 'ID!' &&
    userFields?.name?.type?.toString() === 'String!' &&
    userFields?.email?.type?.toString() === 'String!' &&
    userFields?.posts?.type?.toString() === '[Post!]!'
  );
  $test.check('type User defines id: ID!, name: String!, email: String!, and posts: [Post!]!', hasUserValid, userFields);

  // Case 3: Post type has id: ID!, title: String!, published: Boolean!, and author: User!
  const postType = parsedSchema?.getType('Post');
  const postFields = postType?.getFields?.();
  const hasPostValid = Boolean(
    postFields?.id?.type?.toString() === 'ID!' &&
    postFields?.title?.type?.toString() === 'String!' &&
    postFields?.published?.type?.toString() === 'Boolean!' &&
    postFields?.author?.type?.toString() === 'User!'
  );
  $test.check('type Post defines id: ID!, title: String!, published: Boolean!, and author: User!', hasPostValid, postFields);

  // Case 4: CreatePostInput defines title: String!, authorId: ID!, and published: Boolean = false
  const inputType = parsedSchema?.getType('CreatePostInput');
  const inputFields = inputType?.getFields?.();
  const hasInputValid = Boolean(
    inputFields?.title?.type?.toString() === 'String!' &&
    inputFields?.authorId?.type?.toString() === 'ID!' &&
    inputFields?.published?.type?.toString() === 'Boolean' &&
    (inputFields?.published?.defaultValue === false || inputFields?.published?.astNode?.defaultValue?.value === false || inputFields?.published?.default?.literal?.value === false)
  );
  $test.check('input CreatePostInput defines title: String!, authorId: ID!, published: Boolean = false', hasInputValid, inputFields);
})();
