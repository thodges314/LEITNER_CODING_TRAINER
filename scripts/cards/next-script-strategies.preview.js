function Preview() {
  const props = usePreviewProps({
    analyticsId: 'UA-998877',
  });

  return (
    <div className="flex justify-center p-6 bg-slate-900 min-h-[260px] text-slate-100">
      <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
          <span>Script Strategy Monitor</span>
          <span className="text-xs font-mono text-emerald-400">next/script</span>
        </h3>
        <AnalyticsScripts analyticsId={props.analyticsId} />
        <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-3">
          <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="font-mono text-blue-300">analytics.example.com</span>
            <span className="rounded bg-blue-950 px-2 py-0.5 font-mono text-blue-400 border border-blue-800/60">
              afterInteractive
            </span>
          </div>
          <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
            <span className="font-mono text-amber-300">chat.example.com</span>
            <span className="rounded bg-amber-950 px-2 py-0.5 font-mono text-amber-400 border border-amber-800/60">
              lazyOnload
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

<Preview />
