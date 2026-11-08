await (async () => {
  const { render, fire, q } = $dom;
  const FavComp = typeof FavoriteButton === 'function' ? FavoriteButton : (typeof solution === 'object' && solution?.FavoriteButton);
  const CardComp = typeof ProductCard === 'function' ? ProductCard : (typeof solution === 'object' && solution?.ProductCard);

  const case1 = 'FavoriteButton renders with initial state and accessible aria-pressed';
  const case2 = 'FavoriteButton toggles state and calls onToggle callback on click';
  const case3 = 'ProductCard renders server product details and embeds FavoriteButton';
  const case4 = 'ProductCard forwards productId and initialFavorited to FavoriteButton';

  if (!FavComp || !CardComp) {
    $test.check(case1, false, { error: 'FavoriteButton or ProductCard is not defined' });
    $test.check(case2, false, { error: 'FavoriteButton or ProductCard is not defined' });
    $test.check(case3, false, { error: 'FavoriteButton or ProductCard is not defined' });
    $test.check(case4, false, { error: 'FavoriteButton or ProductCard is not defined' });
    return;
  }

  // Case 1: FavoriteButton renders with initial state and accessible aria-pressed
  const { container: c1, unmount: u1 } = render(
    React.createElement(FavComp, { productId: 'p-1', initialFavorited: false })
  );
  const b1 = q('[data-testid="favorite-button"]', c1);
  const isAriaFalse = b1?.getAttribute('aria-pressed') === 'false';
  const labelAdd = b1?.textContent?.trim() === 'Add to Favorites';
  const isTypeBtn = b1?.getAttribute('type') === 'button';
  $test.check(
    case1,
    b1 !== null && isAriaFalse && labelAdd && isTypeBtn,
    { found: Boolean(b1), ariaPressed: b1?.getAttribute('aria-pressed'), text: b1?.textContent?.trim() }
  );
  u1();

  // Case 2: FavoriteButton toggles state and calls onToggle callback on click
  const toggles2: Array<{ id: string; fav: boolean }> = [];
  const onToggleHandler2 = function () {
    toggles2.push({ id: String(arguments[0]), fav: Boolean(arguments[1]) });
  };

  const { container: c2, unmount: u2 } = render(
    React.createElement(FavComp, {
      productId: 'p-1',
      initialFavorited: false,
      onToggle: onToggleHandler2,
    })
  );
  const b2 = q('[data-testid="favorite-button"]', c2);
  if (b2) fire.click(b2);
  const isAriaTrue = b2?.getAttribute('aria-pressed') === 'true';
  const labelFav = b2?.textContent?.trim() === 'Favorited';
  const firedCorrectly = toggles2.length === 1 && toggles2[0].id === 'p-1' && toggles2[0].fav === true;
  $test.check(
    case2,
    isAriaTrue && labelFav && firedCorrectly,
    { ariaPressed: b2?.getAttribute('aria-pressed'), text: b2?.textContent?.trim(), toggles: toggles2 }
  );
  u2();

  // Case 3: ProductCard renders server product details and embeds FavoriteButton
  const { container: c3, unmount: u3 } = render(
    React.createElement(CardComp, {
      product: { id: 'prod-99', name: 'Wireless Headphones', price: 99 },
    })
  );
  const cardEl = q('[data-testid="product-card"]', c3);
  const titleEl = q('[data-testid="product-title"]', c3);
  const priceEl = q('[data-testid="product-price"]', c3);
  const embeddedBtn = q('[data-testid="favorite-button"]', c3);
  $test.check(
    case3,
    cardEl !== null &&
      titleEl?.textContent?.trim() === 'Wireless Headphones' &&
      priceEl?.textContent?.trim() === '$99' &&
      embeddedBtn !== null,
    {
      title: titleEl?.textContent?.trim(),
      price: priceEl?.textContent?.trim(),
      hasButton: Boolean(embeddedBtn),
    }
  );
  u3();

  // Case 4: ProductCard forwards productId and initialFavorited to FavoriteButton
  const { container: c4, unmount: u4 } = render(
    React.createElement(CardComp, {
      product: { id: 'prod-99', name: 'Wireless Headphones', price: 99 },
      initialFavorited: true,
    })
  );
  const b4 = q('[data-testid="favorite-button"]', c4);
  const startsFavorited = b4?.getAttribute('aria-pressed') === 'true';
  const labelFavorited = b4?.textContent?.trim() === 'Favorited';
  if (b4) fire.click(b4);
  const toggledOff = b4?.getAttribute('aria-pressed') === 'false';
  const labelAddAfterToggle = b4?.textContent?.trim() === 'Add to Favorites';
  $test.check(
    case4,
    startsFavorited && labelFavorited && toggledOff && labelAddAfterToggle,
    { startsFavorited, labelFavorited, toggledOff, labelAddAfterToggle }
  );
  u4();
})();
