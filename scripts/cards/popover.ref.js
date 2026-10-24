function Popover({
  trigger,
  content,
  placement = 'bottom',
  isOpen: controlledIsOpen,
  onToggle,
  title,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const containerRef = useRef(null);

  const setOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    if (typeof onToggle === 'function') {
      onToggle(nextOpen);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        data-action="trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>

      {open && (() => {
        const placementStyles = {
          top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
          bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
          left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
          right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' },
        }[placement] || { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };

        return (
          <div
            role="dialog"
            aria-modal="false"
            data-placement={placement}
            style={{ position: 'absolute', zIndex: 100, ...placementStyles }}
          >
            {title && <h3 data-title>{title}</h3>}
            <button
              type="button"
              data-action="close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              X
            </button>
            <div>{content}</div>
          </div>
        );
      })()}
    </div>
  );
}
