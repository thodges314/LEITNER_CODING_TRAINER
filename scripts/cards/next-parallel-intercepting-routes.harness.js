await (async () => {
  const { render, q, fire } = $dom;

  const LayoutComp = typeof FeedLayout === 'function' ? FeedLayout : (typeof solution === 'object' && solution?.FeedLayout);
  const ModalComp = typeof PhotoModal === 'function' ? PhotoModal : (typeof solution === 'object' && solution?.PhotoModal);

  const case1 = 'FeedLayout renders children and parallel modal slot when modal prop is present';
  const case2 = 'FeedLayout omits modal slot container when modal prop is absent';
  const case3 = 'PhotoModal renders dialog with photo image and close button';
  const case4 = 'Clicking close button triggers router.back() and optional onDismiss callback';

  if (!LayoutComp || !ModalComp) {
    $test.check(case1, false, { error: 'FeedLayout or PhotoModal is not defined' });
    $test.check(case2, false, { error: 'FeedLayout or PhotoModal is not defined' });
    $test.check(case3, false, { error: 'FeedLayout or PhotoModal is not defined' });
    $test.check(case4, false, { error: 'FeedLayout or PhotoModal is not defined' });
    return;
  }

  // Case 1: FeedLayout with modal
  const { container: c1 } = render(
    React.createElement(
      LayoutComp,
      { modal: React.createElement('div', { 'data-testid': 'mock-modal' }, 'Modal Content') },
      React.createElement('div', { 'data-testid': 'feed-list' }, 'Feed Items')
    )
  );
  const feedContent = q('[data-testid="feed-content"]', c1);
  const modalSlot = q('[data-testid="modal-slot"]', c1);
  $test.check(
    case1,
    feedContent !== null && modalSlot !== null && modalSlot.textContent.includes('Modal Content') && feedContent.textContent.includes('Feed Items'),
    { hasFeed: !!feedContent, hasSlot: !!modalSlot }
  );

  // Case 2: FeedLayout without modal
  const { container: c2 } = render(
    React.createElement(
      LayoutComp,
      null,
      React.createElement('div', null, 'Solo Feed')
    )
  );
  const absentSlot = q('[data-testid="modal-slot"]', c2);
  $test.check(
    case2,
    absentSlot === null,
    { absentSlot }
  );

  // Case 3: PhotoModal rendering
  const { container: c3 } = render(
    React.createElement(ModalComp, { id: 'pic-42', photoUrl: 'https://images.example.com/pic-42.jpg' })
  );
  const dialogEl = q('[data-testid="photo-modal"]', c3);
  const imgEl = q('[data-testid="modal-photo"]', c3);
  const closeBtn = q('[data-testid="modal-close"]', c3);
  $test.check(
    case3,
    dialogEl !== null &&
      dialogEl.classList.contains('modal-dialog') &&
      imgEl?.getAttribute('src') === 'https://images.example.com/pic-42.jpg' &&
      imgEl?.getAttribute('alt') === 'Photo pic-42' &&
      closeBtn !== null,
    { hasDialog: !!dialogEl, src: imgEl?.getAttribute('src') }
  );

  // Case 4: Close button interaction
  let dismissed: boolean = false;
  let backCount = 0;
  const mockBack = () => { backCount++; };
  setMockRouter({ back: mockBack });

  const { container: c4 } = render(
    React.createElement(ModalComp, {
      id: 'pic-99',
      photoUrl: 'https://images.example.com/pic-99.jpg',
      onDismiss: () => { dismissed = true; },
    })
  );
  const closeBtn4 = q('[data-testid="modal-close"]', c4);
  if (closeBtn4) {
    fire.click(closeBtn4);
  }
  $test.check(
    case4,
    Boolean(dismissed) && backCount === 1,
    { dismissed, backCount }
  );
})();
