async function fetchGraphQL(endpoint, query, variables, headers = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const payload = await response.json();

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(`GraphQL error: ${payload.errors[0].message}`);
  }

  return payload.data;
}
