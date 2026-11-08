await (async () => {
  const { render, q, fire } = $dom;
  const Comp = typeof SearchFilter === 'function' ? SearchFilter : (typeof solution === 'object' && solution?.SearchFilter);

  const case1 = 'SearchFilter reads searchParams and displays current pathname';
  const case2 = 'Submitting search query navigates via router.push with encoded query string';
  const case3 = 'Submitting empty search input navigates to base pathname without query parameter';
  const case4 = 'Falls back to defaultQuery when searchParams has no "q" parameter';

  if (!Comp) {
    $test.check(case1, false, { error: 'SearchFilter is not defined' });
    $test.check(case2, false, { error: 'SearchFilter is not defined' });
    $test.check(case3, false, { error: 'SearchFilter is not defined' });
    $test.check(case4, false, { error: 'SearchFilter is not defined' });
    return;
  }

  // Setup initial mock route state
  setMockPathname('/products');
  setMockSearchParams(new URLSearchParams('q=running+shoes'));

  let pushedUrls: string[] = [];
  setMockRouter({
    push: (url: string) => { pushedUrls.push(url); },
  });

  // Case 1: Initial state read from searchParams and pathname
  const { container: c1 } = render(React.createElement(Comp));
  const inputEl = q('[data-testid="search-input"]', c1) as HTMLInputElement | null;
  const pathEl = q('[data-testid="current-path"]', c1);

  $test.check(
    case1,
    inputEl !== null && inputEl.value === 'running shoes' && pathEl?.textContent === '/products',
    { inputValue: inputEl?.value, pathText: pathEl?.textContent }
  );

  // Case 2: Submitting query invokes router.push with encoded param
  const formEl = q('form', c1);
  if (inputEl) {
    fire.change(inputEl, 'hiking boots');
  }
  if (formEl) {
    fire.submit(formEl);
  }

  const lastPushed = pushedUrls[pushedUrls.length - 1];
  $test.check(
    case2,
    lastPushed === '/products?q=hiking%20boots',
    { pushedUrls, lastPushed }
  );

  // Case 3: Submitting empty query navigates to base pathname
  if (inputEl) {
    fire.change(inputEl, '   ');
  }
  if (formEl) {
    fire.submit(formEl);
  }
  const pushedEmpty = pushedUrls[pushedUrls.length - 1];
  $test.check(
    case3,
    pushedEmpty === '/products',
    { pushedEmpty }
  );

  // Case 4: Falls back to defaultQuery
  setMockSearchParams(new URLSearchParams(''));
  const { container: c4 } = render(React.createElement(Comp, { defaultQuery: 'jackets' }));
  const inputEl4 = q('[data-testid="search-input"]', c4) as HTMLInputElement | null;
  $test.check(
    case4,
    inputEl4?.value === 'jackets',
    { value: inputEl4?.value }
  );
})();
