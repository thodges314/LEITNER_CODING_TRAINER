interface AnalyticsScriptsProps {
  analyticsId: string;
}

function AnalyticsScripts({ analyticsId }: AnalyticsScriptsProps): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'scripts-container' },
    React.createElement(Script, {
      src: `https://analytics.example.com/tag.js?id=${encodeURIComponent(analyticsId)}`,
      strategy: 'afterInteractive',
      'data-testid': 'analytics-script',
    }),
    React.createElement(Script, {
      src: 'https://chat.example.com/widget.js',
      strategy: 'lazyOnload',
      'data-testid': 'chat-widget-script',
    })
  );
}

