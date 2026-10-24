interface DropdownMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownMenuItem[];
  onSelect?: (id: string) => void;
}

function DropdownMenu({ label, items, onSelect }: DropdownMenuProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const enabledItems = (): HTMLElement[] => {
    if (!menuRef.current) return [];
    return Array.from(menuRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')) as HTMLElement[];
  };

  useEffect(() => {
    if (open) enabledItems()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const close = (refocus?: boolean): void => {
    setOpen(false);
    if (refocus && triggerRef.current) triggerRef.current.focus();
  };

  const choose = (item: DropdownMenuItem): void => {
    if (item.disabled) return;
    if (onSelect) onSelect(item.id);
    close(true);
  };

  const onMenuKeyDown = (e: KeyboardEvent): void => {
    const els = enabledItems();
    const index = els.indexOf(document.activeElement as HTMLElement);
    const focusAt = (n: number): void => {
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
      <button ref={triggerRef} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o: boolean) => !o)}>
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
              onKeyDown={(e: unknown) => {
                const ev = e as KeyboardEvent;
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
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
