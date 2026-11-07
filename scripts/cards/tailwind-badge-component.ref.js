function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) {
  const variantStyles = {
    success: {
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400',
    },
    warning: {
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400',
    },
    danger: {
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400',
    },
    info: {
      classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      dotColor: 'bg-sky-400',
    },
    neutral: {
      classes: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      dotColor: 'bg-slate-400',
    },
  };

  const sizeStyles = {
    sm: {
      classes: 'text-xs px-2 py-0.5 gap-1',
      dotSize: 'h-1.5 w-1.5',
    },
    md: {
      classes: 'text-sm px-2.5 py-1 gap-1.5',
      dotSize: 'h-2 w-2',
    },
  };

  const activeVariant = variantStyles[variant] || variantStyles.neutral;
  const activeSize = sizeStyles[size] || sizeStyles.md;

  const baseClasses =
    'inline-flex items-center font-medium rounded-full border transition-colors';
  const containerClassName = `${baseClasses} ${activeVariant.classes} ${activeSize.classes}`;

  return (
    <span className={containerClassName} {...props}>
      {dot && (
        <span
          className={`rounded-full shrink-0 ${activeSize.dotSize} ${activeVariant.dotColor}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
