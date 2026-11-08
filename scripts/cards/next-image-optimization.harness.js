await (async () => {
  const { render, renderError, q } = $dom;
  const ImageComp = typeof NextImage === 'function' ? NextImage : (typeof solution === 'object' && solution?.NextImage);

  if (!ImageComp) {
    $test.check('Renders standard image with explicit width, height, and lazy loading', false, { error: 'NextImage is not defined' });
    $test.check('Sets loading="eager" and fetchPriority="high" when priority is true', false, { error: 'NextImage is not defined' });
    $test.check('Renders responsive fill image without fixed width and height attributes', false, { error: 'NextImage is not defined' });
    $test.check('Throws error when neither dimensions nor fill=true is supplied', false, { error: 'NextImage is not defined' });
    return;
  }

  // Case 1: Renders standard image with explicit width, height, and lazy loading
  const { container: c1, unmount: u1 } = render(
    React.createElement(ImageComp, {
      src: '/images/avatar.png',
      alt: 'User profile picture',
      width: 120,
      height: 120,
    })
  );
  const img1 = q('[data-testid="next-image"]', c1);
  const isWidth120 = img1?.getAttribute('width') === '120';
  const isHeight120 = img1?.getAttribute('height') === '120';
  const isLazy = img1?.getAttribute('loading') === 'lazy';
  $test.check(
    'Renders standard image with explicit width, height, and lazy loading',
    img1 !== null && isWidth120 && isHeight120 && isLazy,
    { width: img1?.getAttribute('width'), height: img1?.getAttribute('height'), loading: img1?.getAttribute('loading') }
  );
  u1();

  // Case 2: Sets loading="eager" and fetchPriority="high" when priority is true
  const { container: c2, unmount: u2 } = render(
    React.createElement(ImageComp, {
      src: '/images/hero.jpg',
      alt: 'Hero background banner',
      width: 1200,
      height: 600,
      priority: true,
    })
  );
  const img2 = q('[data-testid="next-image"]', c2);
  const isEager = img2?.getAttribute('loading') === 'eager';
  const isHighFetch = img2?.getAttribute('fetchpriority') === 'high' ||
    img2?.getAttribute('fetchPriority') === 'high' ||
    img2?.fetchPriority === 'high';
  $test.check(
    'Sets loading="eager" and fetchPriority="high" when priority is true',
    isEager && isHighFetch,
    { loading: img2?.getAttribute('loading'), fetchPriority: img2?.getAttribute('fetchpriority') || img2?.fetchPriority }
  );
  u2();

  // Case 3: Renders responsive fill image without fixed width and height attributes
  const { container: c3, unmount: u3 } = render(
    React.createElement(ImageComp, {
      src: '/images/card-bg.jpg',
      alt: 'Card background',
      fill: true,
      className: 'rounded-xl',
    })
  );
  const img3 = q('[data-testid="next-image"]', c3);
  const noDimensions = !img3?.hasAttribute('width') && !img3?.hasAttribute('height');
  const hasFillClasses = Boolean(img3?.classList.contains('absolute') && img3?.classList.contains('inset-0') && img3?.classList.contains('object-cover'));
  $test.check(
    'Renders responsive fill image without fixed width and height attributes',
    noDimensions && hasFillClasses,
    { noDimensions, hasFillClasses, classList: Array.from(img3?.classList || []) }
  );
  u3();

  // Case 4: Throws error when neither dimensions nor fill=true is supplied
  let caughtMissingDimensions = false;
  try {
    ImageComp({ src: '/broken.png', alt: 'Missing dimensions' });
  } catch {
    caughtMissingDimensions = true;
  }
  if (!caughtMissingDimensions && typeof renderError === 'function') {
    const err = renderError(React.createElement(ImageComp, { src: '/broken.png', alt: 'Missing dimensions' }));
    if (err) caughtMissingDimensions = true;
  }
  $test.check(
    'Throws error when neither dimensions nor fill=true is supplied',
    caughtMissingDimensions,
    { caughtMissingDimensions }
  );
})();
