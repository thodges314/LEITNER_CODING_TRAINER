await (async () => {
  const Comp = typeof RootLayout === 'function' ? RootLayout : (typeof solution === 'object' && solution?.RootLayout);

  const case1 = 'RootLayout applies font CSS variable to html element';
  const case2 = 'RootLayout applies font className to body element and renders children';
  const case3 = 'Sets lang="en" on the html element';
  const case4 = 'Forwards children intact into data-testid="root-body"';

  if (!Comp) {
    $test.check(case1, false, { error: 'RootLayout is not defined' });
    $test.check(case2, false, { error: 'RootLayout is not defined' });
    $test.check(case3, false, { error: 'RootLayout is not defined' });
    $test.check(case4, false, { error: 'RootLayout is not defined' });
    return;
  }

  const childEl = React.createElement('main', { 'data-testid': 'app-content' }, 'App Page');
  const rootElement = Comp({ children: childEl });

  const htmlType = rootElement?.type;
  const htmlLang = rootElement?.props?.lang;
  const htmlClass = rootElement?.props?.className;

  const bodyElement = rootElement?.props?.children;
  const bodyType = bodyElement?.type;
  const bodyClass = bodyElement?.props?.className;
  const bodyTestId = bodyElement?.props?.['data-testid'];
  const innerChild = bodyElement?.props?.children;

  const hasVariable = typeof htmlClass === 'string' && htmlClass.includes('--font-inter');
  $test.check(
    case1,
    htmlType === 'html' && Boolean(hasVariable),
    { htmlType, htmlClass }
  );

  const hasBodyClass = typeof bodyClass === 'string' && (bodyClass.includes('inter') || bodyClass.length > 0);
  $test.check(
    case2,
    bodyType === 'body' && Boolean(hasBodyClass),
    { bodyType, bodyClass }
  );

  $test.check(
    case3,
    htmlLang === 'en',
    { htmlLang }
  );

  $test.check(
    case4,
    bodyTestId === 'root-body' && innerChild === childEl,
    { bodyTestId, innerChildMatched: innerChild === childEl }
  );
})();
