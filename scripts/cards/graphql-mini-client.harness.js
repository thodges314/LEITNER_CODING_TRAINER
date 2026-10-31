const originalFetch = fetch;

try {
  await $test.run("Sends POST request with query and variables in JSON body", async () => {
    let captured = null;
    fetch = async (url, init) => {
      captured = { url, ...init, parsedBody: JSON.parse(init.body) };
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { viewer: { id: '1', name: 'Alice' } } }),
      };
    };

    const res = await fetchGraphQL('/graphql', 'query { viewer { name } }', { limit: 10 });
    const isPost = captured.method === 'POST';
    const hasContentType = captured.headers['Content-Type'] === 'application/json';
    const matchesQuery = captured.parsedBody.query === 'query { viewer { name } }';
    const matchesVars = captured.parsedBody.variables?.limit === 10;
    return isPost && hasContentType && matchesQuery && matchesVars && res.viewer.name === 'Alice';
  }, () => true);

  await $test.run("Merges custom headers into request", async () => {
    let capturedHeaders = null;
    fetch = async (_url, init) => {
      capturedHeaders = init.headers;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { count: 42 } }),
      };
    };

    const res = await fetchGraphQL('/graphql', 'query { count }', undefined, { 'Authorization': 'Bearer token-xyz' });
    const hasAuth = capturedHeaders['Authorization'] === 'Bearer token-xyz';
    const hasContentType = capturedHeaders['Content-Type'] === 'application/json';
    return hasAuth && hasContentType && res.count === 42;
  }, () => true);

  await $test.run("Returns data when errors array is empty", async () => {
    fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { active: true },
        errors: [],
      }),
    });

    const res = await fetchGraphQL('/graphql', 'query { active }');
    return res.active === true;
  }, () => true);

  fetch = async () => ({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: async () => ({}),
  });
  await $test.rejects("Throws an error if response.ok is false", () => fetchGraphQL('/graphql', 'query { viewer { id } }'), '500');

  fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      errors: [{ message: 'Field "secret" does not exist on type "User"' }],
    }),
  });
  await $test.rejects("Throws an error if GraphQL errors are returned in payload", () => fetchGraphQL('/graphql', 'query { secret }'), 'Field "secret" does not exist');

  fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  await $test.rejects("Propagates network errors if fetch rejects", () => fetchGraphQL('/graphql', 'query { viewer { id } }'), 'Failed to fetch');
} finally {
  fetch = originalFetch;
}
