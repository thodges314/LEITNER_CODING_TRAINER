const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  ...props
}) => {
  const formatDimension = (dim) => {
    if (typeof dim === 'number') return `${dim}px`;
    return dim;
  };

  const style = {};
  if (width !== undefined) style.width = formatDimension(width);
  if (height !== undefined) style.height = formatDimension(height);

  const basePulse = 'animate-pulse bg-slate-800';

  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-label="Loading..."
        aria-busy="true"
        style={style}
        className={`p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 ${className}`.trim()}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className={`${basePulse} h-10 w-10 rounded-full shrink-0`} />
          <div className="space-y-1.5 flex-1">
            <div className={`${basePulse} h-3.5 w-28 rounded-md`} />
            <div className={`${basePulse} h-2.5 w-20 rounded-md`} />
          </div>
        </div>
        <div className={`${basePulse} h-28 w-full rounded-xl`} />
        <div className="space-y-2">
          <div className={`${basePulse} h-3 w-full rounded-md`} />
          <div className={`${basePulse} h-3 w-3/4 rounded-md`} />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    const defaultClasses = `${basePulse} rounded-full shrink-0 ${width ? '' : 'w-10'} ${height ? '' : 'h-10'}`;
    return (
      <div
        role="status"
        aria-label="Loading..."
        aria-busy="true"
        style={style}
        className={`${defaultClasses} ${className}`.trim()}
        {...props}
      />
    );
  }

  if (variant === 'rectangular') {
    const defaultClasses = `${basePulse} rounded-xl ${width ? '' : 'w-full'} ${height ? '' : 'h-32'}`;
    return (
      <div
        role="status"
        aria-label="Loading..."
        aria-busy="true"
        style={style}
        className={`${defaultClasses} ${className}`.trim()}
        {...props}
      />
    );
  }

  // variant === 'text'
  if (lines > 1) {
    return (
      <div
        role="status"
        aria-label="Loading..."
        aria-busy="true"
        style={style}
        className={`space-y-2.5 ${className}`.trim()}
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => {
          const isLast = i === lines - 1;
          const lineClasses = `${basePulse} h-4 rounded-md ${isLast ? 'w-4/5' : 'w-full'}`;
          return <div key={i} className={lineClasses} />;
        })}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading..."
      aria-busy="true"
      style={style}
      className={`${basePulse} h-4 rounded-md ${width ? '' : 'w-full'} ${className}`.trim()}
      {...props}
    />
  );
};

