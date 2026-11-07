const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  className: extraClassName = '',
  ...props
}) => {
  const isDisabled = Boolean(disabled || loading);

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-600',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500',
    destructive: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
    outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800 focus-visible:ring-slate-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 cursor-pointer';

  const disabledClasses = isDisabled
    ? 'disabled:opacity-50 disabled:pointer-events-none cursor-not-allowed'
    : '';

  const activeVariant = variantClasses[variant] || variantClasses.primary;
  const activeSize = sizeClasses[size] || sizeClasses.md;

  const className = [baseClasses, activeVariant, activeSize, disabledClasses, extraClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      onClick={isDisabled ? undefined : onClick}
      className={className}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx={12}
            cy={12}
            r={10}
            stroke="currentColor"
            strokeWidth={4}
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
