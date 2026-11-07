const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-5 py-2',
  }[size] || 'text-sm px-3.5 py-1.5';

  const containerClasses = [
    'inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl select-none items-center',
    fullWidth ? 'w-full' : 'w-auto',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e, currentIndex) => {
    const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const isPrev = e.key === 'ArrowLeft' || e.key === 'ArrowUp';

    if (!isNext && !isPrev) return;

    e.preventDefault();

    const enabledIndices = options
      .map((opt, idx) => (opt.disabled ? -1 : idx))
      .filter((idx) => idx !== -1);

    if (enabledIndices.length === 0) return;

    const currentPos = enabledIndices.indexOf(currentIndex);
    let nextPos = currentPos;

    if (isNext) {
      nextPos = (currentPos + 1) % enabledIndices.length;
    } else if (isPrev) {
      nextPos = (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
    }

    const nextIndex = enabledIndices[nextPos];
    const nextOption = options[nextIndex];

    if (nextOption) {
      if (typeof onChange === 'function') {
        onChange(nextOption.value);
      }
      if (containerRef.current) {
        const buttons = containerRef.current.querySelectorAll('button[role="tab"]');
        buttons[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-orientation="horizontal"
      className={containerClasses}
      {...props}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isDisabled = Boolean(option.disabled);

        const stateClasses = isSelected
          ? 'bg-indigo-600 text-white shadow-sm'
          : isDisabled
          ? 'opacity-40 cursor-not-allowed pointer-events-none'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';

        const buttonClasses = [
          'inline-flex items-center justify-center font-medium transition-all rounded-lg text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          sizeClasses,
          fullWidth ? 'flex-1' : '',
          stateClasses,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected ? 'true' : 'false'}
            tabIndex={isSelected ? 0 : -1}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled && typeof onChange === 'function') {
                onChange(option.value);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={buttonClasses}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

