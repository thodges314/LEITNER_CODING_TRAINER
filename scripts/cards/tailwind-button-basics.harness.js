await (async () => {
  const { render } = $dom;
  const Component = typeof Button === 'function' ? Button : (typeof globalThis !== 'undefined' ? globalThis.Button : undefined);

  const case1 = 'Renders button with default primary variant and base interactive classes';
  const case2 = 'Applies outline variant classes when variant="outline"';
  const case3 = 'Applies disabled attribute and opacity/pointer-events utilities when disabled=true';
  const case4 = 'Forwards extra props such as onClick and data-testid';

  if (typeof Component !== 'function') {
    $test.check(case1, false, { error: 'Button is not defined' });
    $test.check(case2, false, { error: 'Button is not defined' });
    $test.check(case3, false, { error: 'Button is not defined' });
    $test.check(case4, false, { error: 'Button is not defined' });
    return;
  }

  // Case 1: Primary default
  const { container: c1, unmount: u1 } = render(React.createElement(Component, null, 'Submit'));
  const btn1 = c1.querySelector('button');
  const cls1 = btn1?.className || '';
  const pass1 = Boolean(btn1) &&
    btn1?.getAttribute('type') === 'button' &&
    cls1.includes('bg-blue-600') &&
    cls1.includes('text-white') &&
    cls1.includes('hover:bg-blue-700') &&
    cls1.includes('rounded-lg') &&
    btn1?.textContent === 'Submit';
  $test.check(case1, Boolean(pass1), { classList: cls1, text: btn1?.textContent });
  u1();

  // Case 2: Outline variant
  const { container: c2, unmount: u2 } = render(
    React.createElement(Component, { variant: 'outline' }, 'Cancel')
  );
  const btn2 = c2.querySelector('button');
  const cls2 = btn2?.className || '';
  const pass2 = Boolean(btn2) &&
    cls2.includes('border-gray-300') &&
    cls2.includes('text-gray-700') &&
    cls2.includes('hover:bg-gray-50');
  $test.check(case2, Boolean(pass2), { classList: cls2 });
  u2();

  // Case 3: Disabled state
  const { container: c3, unmount: u3 } = render(
    React.createElement(Component, { disabled: true }, 'Disabled')
  );
  const btn3 = c3.querySelector('button');
  const cls3 = btn3?.className || '';
  const pass3 = Boolean(btn3) &&
    btn3?.hasAttribute('disabled') &&
    cls3.includes('disabled:opacity-50') &&
    cls3.includes('disabled:pointer-events-none');
  $test.check(case3, Boolean(pass3), { hasDisabled: btn3?.hasAttribute('disabled'), classList: cls3 });
  u3();

  // Case 4: Extra props forwarding
  let clicked = false;
  const { container: c4, unmount: u4 } = render(
    React.createElement(
      Component,
      {
        'data-testid': 'custom-btn',
        'aria-label': 'Custom Action',
        onClick: () => { clicked = true; },
      },
      'Click Me'
    )
  );
  const btn4 = c4.querySelector('button[data-testid="custom-btn"]');
  btn4?.click();
  const pass4 = Boolean(btn4) &&
    btn4?.getAttribute('aria-label') === 'Custom Action' &&
    clicked === true;
  $test.check(case4, Boolean(pass4), { found: Boolean(btn4), clicked });
  u4();
})();
