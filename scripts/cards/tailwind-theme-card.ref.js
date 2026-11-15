function ThemeCard({ title, description, badge }) {
  return (
    <article className="rounded-xl border p-5 transition-colors bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {badge && (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </article>
  );
}
