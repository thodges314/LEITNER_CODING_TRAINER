function DropdownMenu({ label, items, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const enabledItems = () => [...menuRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')];

  useEffect(() => {
    if (open) enabledItems()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const close = (refocus) => {
    setOpen(false);
    if (refocus) triggerRef.current.focus();
  };

  const choose = (item) => {
    if (item.disabled) return;
    if (onSelect) onSelect(item.id);
    close(true);
  };

  const onMenuKeyDown = (e) => {
    const els = enabledItems();
    const index = els.indexOf(document.activeElement);
    const focusAt = (n) => {
      e.preventDefault();
      els[(n + els.length) % els.length]?.focus();
    };
    if (e.key === 'ArrowDown') focusAt(index + 1);
    else if (e.key === 'ArrowUp') focusAt(index - 1);
    else if (e.key === 'Home') focusAt(0);
    else if (e.key === 'End') focusAt(els.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={rootRef}>
      <button ref={triggerRef} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open && (
        <ul role="menu" ref={menuRef} onKeyDown={onMenuKeyDown}>
          {items.map((item) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled ? 'true' : undefined}
              onClick={() => choose(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  choose(item);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
