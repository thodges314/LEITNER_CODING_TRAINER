/**
 * Deterministic stand-in for fetch, used when running card harnesses and the in-app
 * "Run Code" button. It serves a few well-known jsonplaceholder resources, simulates a
 * slow endpoint and a DNS failure, and falls back to the real fetch for anything else.
 */

const DATA: Record<string, unknown> = {
  '/todos/1': { userId: 1, id: 1, title: 'delectus aut autem', completed: false },
  '/todos/2': { userId: 1, id: 2, title: 'quis ut nam facilis et officia qui', completed: false },
  '/users/1': { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
};

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

export function createMockFetch(realFetch?: typeof fetch): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      /* relative URL: fall through to the real fetch */
    }
    if (!parsed) return realFetch ? realFetch(input, init) : Promise.reject(new TypeError('Failed to fetch'));

    if (parsed.hostname.includes('invalid-non-existent')) {
      return Promise.reject(new TypeError('Failed to fetch'));
    }
    if (parsed.hostname === 'jsonplaceholder.typicode.com') {
      if (parsed.pathname === '/photos') {
        // Large/slow endpoint: resolves after 500 ms unless aborted first.
        return new Promise<Response>((resolve, reject) => {
          const timer = setTimeout(() => resolve(response(200, [])), 500);
          init?.signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        });
      }
      const body = DATA[parsed.pathname];
      return Promise.resolve(body === undefined ? response(404, {}) : response(200, body));
    }
    return realFetch ? realFetch(input, init) : Promise.reject(new TypeError('Failed to fetch'));
  }) as typeof fetch;
}
