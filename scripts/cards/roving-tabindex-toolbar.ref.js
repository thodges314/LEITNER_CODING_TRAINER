function Toolbar({ label, items }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const move = (index) => {
    setActive(index);
    const el = refs.current[index];
    if (el) el.focus();
  };

  const onKeyDown = (event, index) => {
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
          ref={(el) => {
            refs.current[i] = el;
          }}
          tabIndex={i === active ? 0 : -1}
          onFocus={() => setActive(i)}
          onClick={() => setActive(i)}
          onKeyDown={(event) => onKeyDown(event, i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
