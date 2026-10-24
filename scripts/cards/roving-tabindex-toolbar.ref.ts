interface ToolbarItem {
  id: string;
  label: string;
}

function Toolbar({
  label,
  items,
}: {
  label: string;
  items: ToolbarItem[];
}): JSX.Element {
  const [active, setActive] = useState<number>(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number): void => {
    setActive(index);
    const el = refs.current[index];
    if (el) el.focus();
  };

  const onKeyDown = (event: { key: string; preventDefault: () => void }, index: number): void => {
    const last = items.length - 1;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(index === last ? 0 : index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(index === 0 ? last : index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(last);
    }
  };

  return (
    <div role="toolbar" aria-label={label} aria-orientation="horizontal">
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          ref={(el: HTMLButtonElement | null): void => {
            refs.current[i] = el;
          }}
          tabIndex={i === active ? 0 : -1}
          onFocus={(): void => setActive(i)}
          onClick={(): void => setActive(i)}
          onKeyDown={(event: { key: string; preventDefault: () => void }): void => onKeyDown(event, i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
