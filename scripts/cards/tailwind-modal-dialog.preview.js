function ModalDialogPreview() {
  const {
    isOpen = true,
    title = 'Confirm Deployment',
    size = 'md',
    content = 'You are about to deploy commit #d03e625 to the production edge network. All active traffic will route to this release.',
  } = usePreviewProps({
    isOpen: true,
    title: 'Confirm Deployment',
    size: 'md',
    content: 'You are about to deploy commit #d03e625 to the production edge network. All active traffic will route to this release.',
  });

  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);

  useEffect(() => {
    setInternalIsOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (typeof log === 'function') log('onClose', { reason: 'dismiss' });
  };

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
      {!internalIsOpen && (
        <button
          type="button"
          onClick={() => {
            setInternalIsOpen(true);
            if (typeof log === 'function') log('openModal', {});
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
        >
          Open Modal Dialog
        </button>
      )}

      <ModalDialog
        isOpen={internalIsOpen}
        size={size}
        title={title}
        onClose={handleClose}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setInternalIsOpen(false);
                if (typeof log === 'function') log('cancel', {});
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setInternalIsOpen(false);
                if (typeof log === 'function') log('confirm', { action: 'deploy' });
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              Deploy to Production
            </button>
          </>
        }
      >
        <p>{content}</p>
      </ModalDialog>
    </div>
  );
}

<ModalDialogPreview />
