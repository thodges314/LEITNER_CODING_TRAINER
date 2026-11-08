await (async () => {
  const case1 = 'Mutates product price via PATCH request to external API';
  const case2 = 'Purges products cache tag on successful update';
  const case3 = 'Purges specific product detail path on successful update';
  const case4 = 'Returns failure result and does not purge caches on HTTP error';

  const fn = typeof updateProduct === 'function' ? updateProduct : (typeof solution === 'function' ? solution : (typeof solution === 'object' && solution?.updateProduct));

  if (typeof fn !== 'function') {
    $test.check(case1, false, { error: 'updateProduct function is not defined' });
    $test.check(case2, false, { error: 'updateProduct function is not defined' });
    $test.check(case3, false, { error: 'updateProduct function is not defined' });
    $test.check(case4, false, { error: 'updateProduct function is not defined' });
    return;
  }

  // Case 1, 2, 3: Successful mutation
  resetRevalidationStore();
  let capturedPatch = { url: '', opts: { method: '', body: '' } };
  (globalThis as any).__mockFetchHandler = async (url: any, opts: any) => {
    capturedPatch = { url: String(url), opts: (opts || {}) };
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'p-1', price: 99 }),
    };
  };

  try {
    const res = await fn({ id: 'p-1', price: 99 });

    // Case 1
    const correctMethod = capturedPatch?.opts?.method === 'PATCH';
    const correctUrl = capturedPatch?.url === 'https://api.example.com/products/p-1';
    let parsedBody = null;
    try {
      parsedBody = capturedPatch?.opts?.body ? JSON.parse(capturedPatch.opts.body) : null;
    } catch {
      parsedBody = null;
    }
    const isSuccess = res?.success === true;
    $test.check(case1, isSuccess && correctMethod && correctUrl && parsedBody?.price === 99, {
      res,
      method: capturedPatch?.opts?.method,
      url: capturedPatch?.url,
      body: parsedBody,
    });

    // Case 2
    $test.check(case2, activeRevalidationStore.tags.has('products'), {
      tags: Array.from(activeRevalidationStore.tags),
    });

    // Case 3
    $test.check(case3, activeRevalidationStore.paths.has('/products/p-1'), {
      paths: Array.from(activeRevalidationStore.paths),
    });
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }

  // Case 4: HTTP failure
  resetRevalidationStore();
  (globalThis as any).__mockFetchHandler = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ error: 'Internal Server Error' }),
  });

  try {
    const errRes = await fn({ id: 'p-2', price: 150 });
    const noTags = activeRevalidationStore.tags.size === 0;
    const noPaths = activeRevalidationStore.paths.size === 0;
    $test.check(case4, errRes?.success === false && errRes?.error === 'Update failed' && noTags && noPaths, {
      errRes,
      tagsCount: activeRevalidationStore.tags.size,
      pathsCount: activeRevalidationStore.paths.size,
    });
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }
})();
