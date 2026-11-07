function ModalDialogPreview() {
  const [isOpen, setIsOpen] = useState(true);
  const {
    title = 'Confirm Deployment',
    size = 'md',
  } = usePreviewProps({
    title: 'Confirm Deployment',
    size: 'md',
  });

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (typeof log === 'function') log('openModal', {});
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          Open Modal Dialog
        </button>
      )}

      <ModalDialog
        isOpen={isOpen}
        size={size}
        title={title}
        onClose={() => {
          setIsOpen(false);
          if (typeof log === 'function') log('closeModal', { reason: 'dismiss' });
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (typeof log === 'function') log('cancel', {});
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (typeof log === 'function') log('confirm', { action: 'deploy' });
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              Deploy to Production
            </button>
          </>
        }
      >
        <p>
          You are about to deploy commit <code className="text-indigo-400">#d03e625</code> to the production edge network. All active traffic will route to this release.
        </p>
      </ModalDialog>
    </div>
  );
}

<ModalDialogPreview />
