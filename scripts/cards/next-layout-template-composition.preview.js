function Preview() {
  const props = usePreviewProps({
    pathname: '/dashboard/analytics',
  });

  return (
    <div className="flex justify-center p-6 bg-slate-900 min-h-[280px] text-slate-100">
      <div className="w-full max-w-lg bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
        <DashboardRoot pathname={props.pathname}>
          <div className="mt-4 p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
            <h4 className="text-xs uppercase font-mono tracking-wider text-blue-400">Current Route</h4>
            <p className="mt-1 font-semibold text-white">{props.pathname}</p>
            <p className="mt-2 text-xs text-slate-400">
              Template remounts with a fresh instance on navigation while Dashboard Shell preserves outer layout state.
            </p>
          </div>
        </DashboardRoot>
      </div>
    </div>
  );
}

<Preview />
