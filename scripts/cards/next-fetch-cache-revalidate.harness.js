await (async () => {
  const catalogFn = typeof fetchProductCatalog === 'function'
    ? fetchProductCatalog
    : (typeof solution === 'object' && solution?.fetchProductCatalog);
  const inventoryFn = typeof fetchLiveInventory === 'function'
    ? fetchLiveInventory
    : (typeof solution === 'object' && solution?.fetchLiveInventory);

  const case1 = 'fetchProductCatalog requests products with revalidate: 60 and category cache tags';
  const case2 = 'fetchProductCatalog throws Error when HTTP response is not ok';
  const case3 = 'fetchLiveInventory requests inventory with cache: "no-store"';
  const case4 = 'fetchLiveInventory throws Error when HTTP response is not ok';

  if (!catalogFn || !inventoryFn) {
    $test.check(case1, false, { error: 'fetchProductCatalog or fetchLiveInventory is not defined' });
    $test.check(case2, false, { error: 'fetchProductCatalog or fetchLiveInventory is not defined' });
    $test.check(case3, false, { error: 'fetchProductCatalog or fetchLiveInventory is not defined' });
    $test.check(case4, false, { error: 'fetchProductCatalog or fetchLiveInventory is not defined' });
    return;
  }

  // Case 1: fetchProductCatalog success
  let capturedCatalog: { url: string; opts: any } = { url: '', opts: {} };
  (globalThis as any).__mockFetchHandler = async (url: any, opts: any) => {
    capturedCatalog = { url: String(url), opts: (opts || {}) };
    return {
      ok: true,
      status: 200,
      json: async () => [{ id: '1', name: 'Laptop', price: 999 }],
    };
  };

  try {
    const products = await catalogFn('laptops');
    const hasUrl = capturedCatalog.url === 'https://api.example.com/products?category=laptops';
    const nextOpts = capturedCatalog.opts?.next;
    const isRevalidate60 = nextOpts?.revalidate === 60;
    const hasTags = Array.isArray(nextOpts?.tags) &&
      nextOpts.tags.includes('products') &&
      nextOpts.tags.includes('category-laptops');
    const returnedData = Array.isArray(products) && products.length === 1 && products[0].name === 'Laptop';

    $test.check(
      case1,
      hasUrl && isRevalidate60 && hasTags && returnedData,
      { url: capturedCatalog.url, nextOpts, returnedData }
    );
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }

  // Case 2: fetchProductCatalog failure
  (globalThis as any).__mockFetchHandler = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ error: 'Server Error' }),
  });

  let catalogErrorThrown = false;
  try {
    await catalogFn('laptops');
  } catch (err: any) {
    catalogErrorThrown = err?.message === 'Failed to fetch product catalog';
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }
  $test.check(
    case2,
    catalogErrorThrown,
    { catalogErrorThrown }
  );

  // Case 3: fetchLiveInventory success
  let capturedInventory: { url: string; opts: any } = { url: '', opts: {} };
  (globalThis as any).__mockFetchHandler = async (url: any, opts: any) => {
    capturedInventory = { url: String(url), opts: (opts || {}) };
    return {
      ok: true,
      status: 200,
      json: async () => ({ productId: 'p-100', stock: 12, available: true }),
    };
  };

  try {
    const inv = await inventoryFn('p-100');
    const hasUrl = capturedInventory.url === 'https://api.example.com/inventory/p-100';
    const isNoStore = capturedInventory.opts?.cache === 'no-store';
    const validInv = inv?.productId === 'p-100' && inv?.stock === 12 && inv?.available === true;

    $test.check(
      case3,
      hasUrl && isNoStore && validInv,
      { url: capturedInventory.url, cache: capturedInventory.opts?.cache, validInv }
    );
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }

  // Case 4: fetchLiveInventory failure
  (globalThis as any).__mockFetchHandler = async () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not Found' }),
  });

  let invErrorThrown = false;
  try {
    await inventoryFn('p-999');
  } catch (err: any) {
    invErrorThrown = err?.message === 'Failed to fetch live inventory';
  } finally {
    (globalThis as any).__mockFetchHandler = null;
  }
  $test.check(
    case4,
    invErrorThrown,
    { invErrorThrown }
  );
})();

