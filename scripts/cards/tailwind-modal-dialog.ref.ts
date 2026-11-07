type ModalSize = 'sm' | 'md' | 'lg';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: any;
  footer?: any;
  size?: ModalSize;
}

const ModalDialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalDialogProps): JSX.Element | null => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const activeSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e: any) => e.stopPropagation()}
        className={`w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-100 ${activeSize}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="p-5 text-sm text-slate-300 space-y-4">{children}</div>
        {footer && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
