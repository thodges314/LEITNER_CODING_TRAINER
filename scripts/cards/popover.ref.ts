type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  title?: string;
}

function Popover({
  trigger,
  content,
  placement = 'bottom',
  isOpen: controlledIsOpen,
  onToggle,
  title,
}: PopoverProps): JSX.Element {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const setOpen = (nextOpen: boolean): void => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    if (typeof onToggle === 'function') {
      onToggle(nextOpen);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleMouseDown = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        e.target instanceof Node &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' } as Record<string, string | number>}
    >
      <button
        type="button"
        data-action="trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(): void => setOpen(!open)}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          data-placement={placement}
          style={
            {
              position: 'absolute',
              zIndex: 100,
            } as Record<string, string | number>
          }
        >
          {title && <h3 data-title>{title}</h3>}
          <button
            type="button"
            data-action="close"
            aria-label="Close"
            onClick={(): void => setOpen(false)}
          >
            X
          </button>
          <div>{content}</div>
        </div>
      )}
    </div>
  );
}
