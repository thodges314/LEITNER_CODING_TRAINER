interface AnalyticsScriptsProps {
  analyticsId: string;
}

function AnalyticsScripts({ analyticsId }: AnalyticsScriptsProps): React.ReactElement {
  return (
    <div data-testid="scripts-container">
      <Script
        src={`https://analytics.example.com/tag.js?id=${encodeURIComponent(analyticsId)}`}
        strategy="afterInteractive"
        data-testid="analytics-script"
      />
      <Script
        src="https://chat.example.com/widget.js"
        strategy="lazyOnload"
        data-testid="chat-widget-script"
      />
    </div>
  );
}
