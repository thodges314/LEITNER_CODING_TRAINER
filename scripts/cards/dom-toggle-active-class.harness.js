await (async () => {
  const fn = typeof bindClassToggle === 'function' ? bindClassToggle : (typeof solution === 'object' && solution?.bindClassToggle);

  if (!fn) {
    $test.check('Initializes default closed state and aria-expanded="false"', false, { error: 'bindClassToggle is not defined' });
    $test.check('Toggles active class and aria-expanded on click', false, { error: 'bindClassToggle is not defined' });
    $test.check('Initializes with custom active class and initialExpanded=true', false, { error: 'bindClassToggle is not defined' });
    $test.check('Throws error when target element is missing and removes listener on destroy', false, { error: 'bindClassToggle is not defined' });
    return;
  }

  // Set up DOM container
  const container = document.createElement('div');
  document.body.appendChild(container);

  try {
    // Case 1: Initializes default closed state and aria-expanded="false"
    container.innerHTML = `
      <button id="btn-1">Toggle Menu</button>
      <nav id="menu-1">Items</nav>
    `;
    const c1 = fn({ triggerId: 'btn-1', targetId: 'menu-1' });
    const btn1 = document.getElementById('btn-1');
    const menu1 = document.getElementById('menu-1');
    const initClosed = !menu1?.classList.contains('active');
    const ariaFalse = btn1?.getAttribute('aria-expanded') === 'false';
    const isExpandedFalse = c1?.isExpanded() === false;
    $test.check(
      'Initializes default closed state and aria-expanded="false"',
      initClosed && ariaFalse && isExpandedFalse,
      { initClosed, aria: btn1?.getAttribute('aria-expanded'), isExpanded: c1?.isExpanded() }
    );

    // Case 2: Toggles active class and aria-expanded on click
    if (btn1) btn1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const clickedOpen = Boolean(menu1?.classList.contains('active')) && btn1?.getAttribute('aria-expanded') === 'true' && c1?.isExpanded() === true;
    if (btn1) btn1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const clickedClosed = !menu1?.classList.contains('active') && btn1?.getAttribute('aria-expanded') === 'false' && c1?.isExpanded() === false;
    $test.check(
      'Toggles active class and aria-expanded on click',
      clickedOpen && clickedClosed,
      { clickedOpen, clickedClosed }
    );
    c1?.destroy();

    // Case 3: Initializes with custom active class and initialExpanded=true
    container.innerHTML = `
      <button id="btn-2">Toggle Drawer</button>
      <div id="drawer-2">Drawer Content</div>
    `;
    const c2 = fn({
      triggerId: 'btn-2',
      targetId: 'drawer-2',
      activeClass: 'drawer-open',
      initialExpanded: true,
    });
    const btn2 = document.getElementById('btn-2');
    const drawer2 = document.getElementById('drawer-2');
    const customInit = Boolean(drawer2?.classList.contains('drawer-open')) && btn2?.getAttribute('aria-expanded') === 'true' && c2?.isExpanded() === true;
    $test.check(
      'Initializes with custom active class and initialExpanded=true',
      customInit,
      { customInit, classList: drawer2 ? Array.from(drawer2.classList) : [], aria: btn2?.getAttribute('aria-expanded') }
    );

    // Case 4: Throws error when target element is missing and removes listener on destroy
    let threwOnMissing = false;
    try {
      fn({ triggerId: 'nonexistent-btn', targetId: 'drawer-2' });
    } catch {
      threwOnMissing = true;
    }
    c2?.destroy();
    // After destroy, click should NOT mutate class
    if (btn2) btn2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const retainedStateAfterDestroy = Boolean(drawer2?.classList.contains('drawer-open')) && btn2?.getAttribute('aria-expanded') === 'true';
    $test.check(
      'Throws error when target element is missing and removes listener on destroy',
      threwOnMissing && retainedStateAfterDestroy,
      { threwOnMissing, retainedStateAfterDestroy }
    );
  } finally {
    document.body.removeChild(container);
  }
})();
