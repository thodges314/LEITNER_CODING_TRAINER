function Typeahead({ onSelect, fetchSuggestions, delay = 300 }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latestRequest = useRef(0);
  const listId = useId();

  useEffect(() => {
    const requestId = ++latestRequest.current; // any older in-flight request is now stale
    if (!query) {
      setItems([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await fetchSuggestions(query);
      if (requestId !== latestRequest.current) return; // out-of-order response
      setItems(results);
      setActive(-1);
      setOpen(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [query, delay, fetchSuggestions]);

  const select = (item) => {
    onSelect(item);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault();
      select(items[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul role="listbox" id={listId}>
          {items.map((item, i) => (
            <li
              key={item}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                select(item);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
