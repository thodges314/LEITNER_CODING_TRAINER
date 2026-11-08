await (async () => {
  const { render, q } = $dom;
  const Comp = typeof AnalyticsScripts === 'function' ? AnalyticsScripts : (typeof solution === 'object' && solution?.AnalyticsScripts);

  const case1 = 'AnalyticsScripts renders core analytics with strategy="afterInteractive"';
  const case2 = 'AnalyticsScripts renders chat widget with strategy="lazyOnload"';
  const case3 = 'Encodes analyticsId parameter into analytics script URL';
  const case4 = 'Renders scripts-container wrapping both scripts';

  if (!Comp) {
    $test.check(case1, false, { error: 'AnalyticsScripts is not defined' });
    $test.check(case2, false, { error: 'AnalyticsScripts is not defined' });
    $test.check(case3, false, { error: 'AnalyticsScripts is not defined' });
    $test.check(case4, false, { error: 'AnalyticsScripts is not defined' });
    return;
  }

  const { container } = render(
    React.createElement(Comp, { analyticsId: 'ga-9988' })
  );

  const containerEl = q('[data-testid="scripts-container"]', container);
  const analyticsScript = q('[data-testid="analytics-script"]', container);
  const chatScript = q('[data-testid="chat-widget-script"]', container);

  const analyticsSrc = analyticsScript?.getAttribute('src');
  const analyticsStrategy = analyticsScript?.getAttribute('data-strategy') || analyticsScript?.getAttribute('strategy');

  $test.check(
    case1,
    analyticsScript !== null &&
      analyticsSrc === 'https://analytics.example.com/tag.js?id=ga-9988' &&
      analyticsStrategy === 'afterInteractive',
    { hasAnalytics: !!analyticsScript, analyticsSrc, analyticsStrategy }
  );

  const chatSrc = chatScript?.getAttribute('src');
  const chatStrategy = chatScript?.getAttribute('data-strategy') || chatScript?.getAttribute('strategy');

  $test.check(
    case2,
    chatScript !== null &&
      chatSrc === 'https://chat.example.com/widget.js' &&
      chatStrategy === 'lazyOnload',
    { hasChat: !!chatScript, chatSrc, chatStrategy }
  );

  // Case 3: Encodes analyticsId
  const { container: c3 } = render(
    React.createElement(Comp, { analyticsId: 'org/123?auth=true' })
  );
  const specialScript = q('[data-testid="analytics-script"]', c3);
  const specialSrc = specialScript?.getAttribute('src');
  $test.check(
    case3,
    specialSrc === 'https://analytics.example.com/tag.js?id=org%2F123%3Fauth%3Dtrue',
    { specialSrc }
  );

  // Case 4: scripts-container wrapper
  $test.check(
    case4,
    containerEl !== null && containerEl.contains(analyticsScript) && containerEl.contains(chatScript),
    { hasContainer: !!containerEl }
  );
})();
