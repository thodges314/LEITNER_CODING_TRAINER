interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

async function fetchGraphQL<T = any>(
  endpoint: string,
  query: string,
  variables?: Record<string, any>,
  headers: Record<string, string> = {}
): Promise<T> {
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

  const payload: GraphQLResponse<T> = await response.json();

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(`GraphQL error: ${payload.errors[0].message}`);
  }

  return payload.data as T;
}
