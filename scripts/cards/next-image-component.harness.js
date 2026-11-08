await (async () => {
  const { render, q } = $dom;
  const Comp = typeof HeroBanner === 'function' ? HeroBanner : (typeof solution === 'object' && solution?.HeroBanner);

  const case1 = 'HeroBanner renders fixed-dimension Image with width, height, and priority';
  const case2 = 'HeroBanner renders responsive fill Image with sizes when fill prop is true';
  const case3 = 'Uses default width (800) and height (400) when omitted in fixed mode';
  const case4 = 'Sets priority to false by default when priority prop is omitted';

  if (!Comp) {
    $test.check(case1, false, { error: 'HeroBanner is not defined' });
    $test.check(case2, false, { error: 'HeroBanner is not defined' });
    $test.check(case3, false, { error: 'HeroBanner is not defined' });
    $test.check(case4, false, { error: 'HeroBanner is not defined' });
    return;
  }

  // Case 1: Fixed dimensions with priority
  const { container: c1 } = render(
    React.createElement(Comp, {
      src: '/hero.jpg',
      alt: 'Hero banner',
      width: 1200,
      height: 600,
      priority: true,
    })
  );
  const wrapper1 = q('.image-wrapper', c1);
  const img1 = q('img', c1);
  const src1 = img1?.getAttribute('src');
  const alt1 = img1?.getAttribute('alt');
  const w1 = img1?.getAttribute('width');
  const h1 = img1?.getAttribute('height');
  const fetchPriority1 = img1?.getAttribute('fetchpriority');

  $test.check(
    case1,
    wrapper1 !== null &&
      img1 !== null &&
      src1 === '/hero.jpg' &&
      alt1 === 'Hero banner' &&
      w1 === '1200' &&
      h1 === '600' &&
      fetchPriority1 === 'high',
    { wrapper1: !!wrapper1, src1, alt1, w1, h1, fetchPriority1 }
  );

  // Case 2: Responsive fill
  const { container: c2 } = render(
    React.createElement(Comp, {
      src: '/bg.jpg',
      alt: 'Background banner',
      fill: true,
    })
  );
  const wrapper2 = q('.relative.aspect-video', c2);
  const img2 = q('img', c2);
  const src2 = img2?.getAttribute('src');
  const alt2 = img2?.getAttribute('alt');
  const sizes2 = img2?.getAttribute('sizes');
  const dataFill2 = img2?.getAttribute('data-fill') || img2?.getAttribute('fill');
  const style2 = img2?.getAttribute('style');
  const isFillStyle = style2?.includes('position: absolute') || dataFill2 === 'true';

  $test.check(
    case2,
    wrapper2 !== null &&
      img2 !== null &&
      src2 === '/bg.jpg' &&
      alt2 === 'Background banner' &&
      sizes2 === '(max-width: 768px) 100vw, 50vw' &&
      isFillStyle,
    { wrapper2: !!wrapper2, src2, sizes2, style2, dataFill2 }
  );

  // Case 3: Default dimensions (800x400)
  const { container: c3 } = render(
    React.createElement(Comp, {
      src: '/product.jpg',
      alt: 'Product',
    })
  );
  const img3 = q('img', c3);
  const w3 = img3?.getAttribute('width');
  const h3 = img3?.getAttribute('height');
  $test.check(
    case3,
    w3 === '800' && h3 === '400',
    { w3, h3 }
  );

  // Case 4: Omitted priority defaults to false
  const fetchPriority3 = img3?.getAttribute('fetchpriority');
  $test.check(
    case4,
    fetchPriority3 !== 'high',
    { fetchPriority3 }
  );
})();
