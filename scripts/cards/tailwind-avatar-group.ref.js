const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({
  src,
  name = '',
  alt,
  status,
  size = 'md',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size] || 'h-10 w-10 text-sm';

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-500',
  };

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }[size] || 'h-2.5 w-2.5';

  const containerClasses = [
    'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none ring-2 ring-slate-900 bg-slate-800 text-slate-200',
    sizeClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showImage = src && !hasError;
  const initials = getInitials(name);

  return (
    <span className={containerClasses} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setHasError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
      {status && statusColors[status] && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-slate-900 ${statusSizes} ${statusColors[status]}`}
          aria-label={status}
        />
      )}
    </span>
  );
};

const AvatarGroup = ({
  avatars = [],
  max = 4,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size] || 'h-10 w-10 text-sm';

  const containerClasses = [
    'inline-flex items-center -space-x-2 overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const visibleAvatars = avatars.slice(0, max);
  const extraCount = Math.max(0, avatars.length - max);

  return (
    <div
      className={containerClasses}
      role="group"
      aria-label="Team avatars"
      {...props}
    >
      {visibleAvatars.map((avatar, idx) => (
        <Avatar
          key={`${avatar.name}-${idx}`}
          size={size}
          {...avatar}
        />
      ))}
      {extraCount > 0 && (
        <span
          className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-medium ring-2 ring-slate-900 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ${sizeClasses}`}
          aria-label={`${extraCount} more team members`}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
};
