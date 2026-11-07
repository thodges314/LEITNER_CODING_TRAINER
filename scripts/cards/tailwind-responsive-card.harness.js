const { render, fire } = $dom;

// 1. Returns null when product is null or undefined
{
  const r1 = render(<ResponsiveProductCard product={null} />);
  const r2 = render(<ResponsiveProductCard product={undefined} />);
  const passed = r1.container.innerHTML === '' && r2.container.innerHTML === '';

  $test.check(
    'Returns null when product is null or undefined',
    passed,
    { html1: r1.container.innerHTML, html2: r2.container.innerHTML }
  );
  r1.unmount();
  r2.unmount();
}

// 2. Renders responsive article with flex-col on mobile and md:flex-row on desktop
{
  const r = render(
    <ResponsiveProductCard
      product={{
        title: 'Mechanical Keyboard',
        description: 'Compact wireless mechanical keyboard with hot-swappable switches.',
        price: 99,
      }}
    />
  );
  const card = r.container.querySelector('article');
  const hasArticle = card !== null && card.tagName.toLowerCase() === 'article';
  const hasFlexCol = card !== null && card.classList.contains('flex-col');
  const hasMdFlexRow = card !== null && card.classList.contains('md:flex-row');
  const hasBorder = card !== null && card.classList.contains('border-slate-800');

  $test.check(
    'Renders responsive article with flex-col on mobile and md:flex-row on desktop',
    Boolean(hasArticle && hasFlexCol && hasMdFlexRow && hasBorder),
    { hasArticle, hasFlexCol, hasMdFlexRow, hasBorder }
  );
  r.unmount();
}

// 3. Renders product image container with aspect-video and md:w-48 md:aspect-square
{
  const r = render(
    <ResponsiveProductCard
      product={{
        title: 'Ergonomic Mouse',
        description: 'Vertical wireless mouse reducing wrist fatigue.',
        price: 49,
        imageUrl: 'https://images.unsplash.com/photo-mouse',
      }}
    />
  );
  const img = r.container.querySelector('img');
  const imgContainer = img?.parentElement;
  const hasImg = img !== null && img.getAttribute('src') === 'https://images.unsplash.com/photo-mouse';
  const hasAspectVideo = imgContainer !== null && imgContainer.classList.contains('aspect-video');
  const hasMdAspectSquare = imgContainer !== null && imgContainer.classList.contains('md:aspect-square');
  const hasMdW48 = imgContainer !== null && imgContainer.classList.contains('md:w-48');

  $test.check(
    'Renders product image container with aspect-video and md:w-48 md:aspect-square',
    Boolean(hasImg && hasAspectVideo && hasMdAspectSquare && hasMdW48),
    { hasImg, hasAspectVideo, hasMdAspectSquare, hasMdW48 }
  );
  r.unmount();
}

// 4. Displays product title, description, and price with optional strikethrough originalPrice
{
  const r = render(
    <ResponsiveProductCard
      product={{
        title: 'Noise Cancelling Headphones',
        description: 'Active noise cancelling over-ear headphones with 30h battery.',
        price: 199,
        originalPrice: 249,
        rating: 4.8,
      }}
    />
  );
  const title = r.container.querySelector('h3');
  const hasTitle = title !== null && title.textContent === 'Noise Cancelling Headphones';
  const hasPrice = r.container.textContent.includes('$199');
  const original = r.container.querySelector('span.line-through');
  const hasOriginal = original !== null && original.textContent.includes('$249');
  const hasRating = r.container.textContent.includes('4.8');

  $test.check(
    'Displays product title, description, and price with optional strikethrough originalPrice',
    Boolean(hasTitle && hasPrice && hasOriginal && hasRating),
    { hasTitle, hasPrice, hasOriginal: Boolean(hasOriginal), hasRating }
  );
  r.unmount();
}

// 5. Renders badge pill overlay and triggers onAddToCart callback when clicked
{
  let clicked = false;
  const r = render(
    <ResponsiveProductCard
      product={{
        title: 'Smart Desk Lamp',
        description: 'Adjustable color temperature LED desk lamp.',
        price: 39,
        badge: 'Best Seller',
      }}
      onAddToCart={() => {
        clicked = true;
      }}
    />
  );
  const badge = r.container.querySelector('span.bg-indigo-500');
  const hasBadge = badge !== null && badge.textContent === 'Best Seller';
  const btn = r.container.querySelector('button');
  if (btn) fire.click(btn);

  $test.check(
    'Renders badge pill overlay and triggers onAddToCart callback when clicked',
    Boolean(hasBadge && clicked),
    { hasBadge: Boolean(hasBadge), clicked }
  );
  r.unmount();
}
