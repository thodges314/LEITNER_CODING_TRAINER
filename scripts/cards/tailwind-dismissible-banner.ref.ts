type BannerVariant = 'info' | 'success' | 'warning' | 'error';

interface DismissibleBannerProps {
  variant?: BannerVariant;
  title: string;
  message: string;
  onDismiss?: () => void;
}

function DismissibleBanner({
  variant = 'info',
  title,
  message,
  onDismiss,
}: DismissibleBannerProps): JSX.Element | null {
  const [visible, setVisible] = useState<boolean>(true);

  if (!visible) return null;

  const variantClasses: Record<BannerVariant, string> = {
    info: 'bg-sky-50 text-sky-900 border-sky-200',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    error: 'bg-rose-50 text-rose-900 border-rose-200',
  };

  const selectedClass = variantClasses[variant] || variantClasses.info;

  const handleDismiss = (): void => {
    setVisible(false);
    if (typeof onDismiss === 'function') onDismiss();
  };

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${selectedClass}`}
    >
      <div className="flex-1 min-w-0">
        <strong className="font-semibold text-sm leading-5 block">{title}</strong>
        <p className="text-sm opacity-90 mt-0.5">{message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
        className="ml-auto p-1 rounded-lg transition-opacity hover:opacity-75 focus:outline-none focus:ring-2 cursor-pointer"
      >
        &times;
      </button>
    </div>
  );
}
