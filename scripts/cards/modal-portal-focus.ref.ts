const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = dialogRef.current ? (dialogRef.current.querySelector(FOCUSABLE) as HTMLElement | null) : null;
    (first || dialogRef.current)?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onKeyDown = (e: unknown): void => {
    const ev = e as KeyboardEvent;
    if (ev.key === 'Escape') {
      onClose();
      return;
    }
    if (ev.key !== 'Tab') return;
    if (!dialogRef.current) return;
    const nodes = dialogRef.current.querySelectorAll(FOCUSABLE);
    if (nodes.length === 0) {
      ev.preventDefault();
      return;
    }
    const first = nodes[0] as HTMLElement;
    const last = nodes[nodes.length - 1] as HTMLElement;
    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  };

  return ReactDOM.createPortal(
    <div
      onKeyDown={onKeyDown}
      onClick={(e: unknown) => {
        const ev = e as MouseEvent;
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" tabIndex={-1} ref={dialogRef}>
        {children}
      </div>
    </div>,
    document.body
  );
}
