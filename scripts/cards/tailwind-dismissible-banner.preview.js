function DismissibleBannerPreview() {
  const {
    variant = 'info',
    title = 'Scheduled Maintenance',
    message = 'We will be conducting database upgrades on Sunday at 02:00 UTC.',
  } = usePreviewProps({
    variant: 'info',
    title: 'Scheduled Maintenance',
    message: 'We will be conducting database upgrades on Sunday at 02:00 UTC.',
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [variant, title, message]);

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[180px] gap-4">
      {dismissed ? (
        <button
          type="button"
          onClick={() => {
            setDismissed(false);
            if (typeof log === 'function') log('reopenBanner', { variant, title });
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
        >
          Re-open Banner
        </button>
      ) : (
        <DismissibleBanner
          key={`${variant}-${title}-${message}`}
          variant={variant}
          title={title}
          message={message}
          onDismiss={() => {
            setDismissed(true);
            if (typeof log === 'function') log('onDismiss', { variant, title });
          }}
        />
      )}
    </div>
  );
}

<DismissibleBannerPreview />
