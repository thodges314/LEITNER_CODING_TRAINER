await (async () => {
  const { render, act } = $dom;
  const Component = typeof ProductPPRPage === 'function'
    ? ProductPPRPage
    : (typeof solution === 'object' && typeof solution?.ProductPPRPage === 'function' ? solution.ProductPPRPage : null);

  const case1 = 'Renders static product shell and Suspense skeleton fallbacks immediately on initial mount';
  const case2 = 'Streams and displays inventory status when inventory promise resolves while reviews are pending';
  const case3 = 'Streams and displays reviews list when reviews promise resolves independently';
  const case4 = 'Renders low-stock warning and handles empty reviews list';

  if (!Component) {
    $test.check(case1, false, { error: 'ProductPPRPage is not defined' });
    $test.check(case2, false, { error: 'ProductPPRPage is not defined' });
    $test.check(case3, false, { error: 'ProductPPRPage is not defined' });
    $test.check(case4, false, { error: 'ProductPPRPage is not defined' });
    return;
  }

  const isVisible = (el: Element | null): boolean => {
    if (!el) return false;
    let curr: HTMLElement | null = el as HTMLElement;
    while (curr) {
      if (curr.style && curr.style.display === 'none') return false;
      curr = curr.parentElement;
    }
    return true;
  };

  const waitFor = async (cond: () => boolean, ms = 2500): Promise<boolean> => {
    const end = Date.now() + ms;
    while (!cond() && Date.now() < end) {
      await act(async () => {
        await new Promise((res) => setTimeout(res, 15));
      });
    }
    return cond();
  };

  function createDeferred<T>() {
    let resolve!: (val: T) => void;
    let reject!: (err: Error) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  const sampleProduct = {
    id: 'prod-99',
    title: 'Summit Trail Vest',
    category: 'Apparel',
    price: 140,
  };

  // Case 1, 2, 3: Initial mount -> inventory resolves -> reviews resolve
  {
    const invDeferred = createDeferred<{ stockCount: number; warehouse: string; lowStockAlert: boolean }>();
    const revDeferred = createDeferred<Array<{ id: string; author: string; rating: number; comment: string }>>();

    let unmountFn: () => void = () => {};
    let renderedContainer: HTMLElement;

    await act(async () => {
      const { container, unmount } = render(
        React.createElement(Component, {
          product: sampleProduct,
          inventoryPromise: invDeferred.promise,
          reviewsPromise: revDeferred.promise,
        })
      );
      renderedContainer = container;
      unmountFn = unmount;
    });

    const shell = renderedContainer!.querySelector('[data-testid="static-product-shell"]');
    const titleEl = renderedContainer!.querySelector('[data-testid="product-title"]');
    const catEl = renderedContainer!.querySelector('[data-testid="product-category"]');
    const priceEl = renderedContainer!.querySelector('[data-testid="product-price"]');
    const invSkeleton = renderedContainer!.querySelector('[data-testid="inventory-skeleton"]');
    const revSkeleton = renderedContainer!.querySelector('[data-testid="reviews-skeleton"]');
    const invStatus = renderedContainer!.querySelector('[data-testid="inventory-status"]');
    const revList = renderedContainer!.querySelector('[data-testid="reviews-list"]');

    const pass1 = Boolean(shell) &&
      titleEl?.textContent?.trim() === 'Summit Trail Vest' &&
      catEl?.textContent?.trim() === 'Apparel' &&
      priceEl?.textContent?.trim() === '$140.00' &&
      isVisible(invSkeleton) &&
      isVisible(revSkeleton) &&
      !isVisible(invStatus) &&
      !isVisible(revList);

    $test.check(case1, Boolean(pass1), {
      hasShell: Boolean(shell),
      title: titleEl?.textContent,
      hasInvSkeleton: isVisible(invSkeleton),
      hasRevSkeleton: isVisible(revSkeleton),
    });

    // Case 2: Resolve inventory promise
    await act(async () => {
      invDeferred.resolve({
        stockCount: 18,
        warehouse: 'Denver Hub',
        lowStockAlert: false,
      });
    });

    await waitFor(() => {
      const el = renderedContainer!.querySelector('[data-testid="inventory-status"]');
      return Boolean(el && isVisible(el) && (el.textContent || '').includes('18 in stock (Denver Hub)'));
    });

    const invStatusEl = renderedContainer!.querySelector('[data-testid="inventory-status"]');
    const invSkeletonAfter = renderedContainer!.querySelector('[data-testid="inventory-skeleton"]');
    const revSkeletonAfter = renderedContainer!.querySelector('[data-testid="reviews-skeleton"]');

    const pass2 = Boolean(invStatusEl) &&
      isVisible(invStatusEl) &&
      (invStatusEl?.textContent || '').includes('18 in stock (Denver Hub)') &&
      !isVisible(invSkeletonAfter) &&
      isVisible(revSkeletonAfter);

    $test.check(case2, Boolean(pass2), {
      inventoryText: invStatusEl?.textContent,
      inventorySkeletonGone: !isVisible(invSkeletonAfter),
      reviewsStillPending: isVisible(revSkeletonAfter),
    });

    // Case 3: Resolve reviews promise
    await act(async () => {
      revDeferred.resolve([
        { id: 'rev-1', author: 'Elena R.', rating: 5, comment: 'Incredible thermal insulation.' },
        { id: 'rev-2', author: 'Marcus B.', rating: 4, comment: 'Fits true to size.' },
      ]);
    });

    await waitFor(() => {
      const list = renderedContainer!.querySelector('[data-testid="reviews-list"]');
      const it1 = renderedContainer!.querySelector('[data-testid="review-item-rev-1"]');
      return Boolean(list && isVisible(list) && it1 && isVisible(it1));
    });

    const reviewsList = renderedContainer!.querySelector('[data-testid="reviews-list"]');
    const item1 = renderedContainer!.querySelector('[data-testid="review-item-rev-1"]');
    const item2 = renderedContainer!.querySelector('[data-testid="review-item-rev-2"]');
    const revSkeletonFinal = renderedContainer!.querySelector('[data-testid="reviews-skeleton"]');

    const pass3 = Boolean(reviewsList) &&
      isVisible(reviewsList) &&
      Boolean(item1) &&
      Boolean(item2) &&
      (item1?.textContent || '').includes('Elena R.') &&
      !isVisible(revSkeletonFinal);

    $test.check(case3, Boolean(pass3), {
      hasReviewsList: isVisible(reviewsList),
      item1Found: Boolean(item1),
      reviewsSkeletonGone: !isVisible(revSkeletonFinal),
    });

    unmountFn();
  }

  // Case 4: Low stock alert & empty reviews list
  {
    const invDeferred2 = createDeferred<{ stockCount: number; warehouse: string; lowStockAlert: boolean }>();
    const revDeferred2 = createDeferred<Array<{ id: string; author: string; rating: number; comment: string }>>();

    let unmountFn2: () => void = () => {};
    let renderedContainer2: HTMLElement;

    await act(async () => {
      const { container, unmount } = render(
        React.createElement(Component, {
          product: { id: 'prod-100', title: 'Carbon Poles', category: 'Gear', price: 85 },
          inventoryPromise: invDeferred2.promise,
          reviewsPromise: revDeferred2.promise,
        })
      );
      renderedContainer2 = container;
      unmountFn2 = unmount;
    });

    await act(async () => {
      invDeferred2.resolve({
        stockCount: 3,
        warehouse: 'Reno Hub',
        lowStockAlert: true,
      });
      revDeferred2.resolve([]);
    });

    await waitFor(() => {
      const low = renderedContainer2!.querySelector('[data-testid="inventory-status"]');
      const noRev = renderedContainer2!.querySelector('[data-testid="no-reviews"]');
      return Boolean(low && isVisible(low) && noRev && isVisible(noRev));
    });

    const lowStockEl = renderedContainer2!.querySelector('[data-testid="inventory-status"]');
    const noReviewsEl = renderedContainer2!.querySelector('[data-testid="no-reviews"]');

    const pass4 = Boolean(lowStockEl) &&
      isVisible(lowStockEl) &&
      (lowStockEl?.textContent || '').includes('Only 3 left! (Reno Hub)') &&
      isVisible(noReviewsEl);

    $test.check(case4, Boolean(pass4), {
      lowStockText: lowStockEl?.textContent,
      hasNoReviewsMessage: isVisible(noReviewsEl),
    });

    unmountFn2();
  }
})();
