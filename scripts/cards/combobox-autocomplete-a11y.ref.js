function AccessibleCombobox({
  id,
  label,
  options = [],
  onSelect = () => {},
  placeholder = '',
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const listboxId = `${id}-listbox`;

  const getNextEnabledIndex = (current, direction) => {
    if (filtered.length === 0) return -1;
    let next = current;
    for (let i = 0; i < filtered.length; i++) {
      next = (next + direction + filtered.length) % filtered.length;
      if (!filtered[next].disabled) return next;
    }
    return -1;
  };

  const selectOption = (opt) => {
    if (opt.disabled) return;
    setQuery(opt.label);
    setIsOpen(false);
    setActiveIdx(-1);
    if (typeof onSelect === 'function') {
      onSelect(opt);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIdx(getNextEnabledIndex(-1, 1));
      } else {
        setActiveIdx(getNextEnabledIndex(activeIdx, 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIdx(getNextEnabledIndex(filtered.length, -1));
      } else {
        setActiveIdx(getNextEnabledIndex(activeIdx, -1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIdx >= 0 && activeIdx < filtered.length) {
        e.preventDefault();
        selectOption(filtered[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setActiveIdx(-1);
      }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    const nextFiltered = options.filter((opt) =>
      opt.label.toLowerCase().includes(val.toLowerCase())
    );
    setIsOpen(nextFiltered.length > 0);
  };

  const activeOption =
    isOpen && activeIdx >= 0 && activeIdx < filtered.length
      ? filtered[activeIdx]
      : null;

  let statusText = '';
  if (isOpen && filtered.length > 0) {
    statusText = `${filtered.length} results available`;
  } else if (query && filtered.length === 0) {
    statusText = 'No results found';
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={activeOption ? activeOption.id : undefined}
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <div role="status" aria-live="polite">
          {statusText}
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul id={listboxId} role="listbox" aria-label={label}>
          {filtered.map((opt, idx) => (
            <li
              key={opt.id}
              id={opt.id}
              role="option"
              aria-selected={idx === activeIdx}
              aria-disabled={opt.disabled || undefined}
              onClick={() => selectOption(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
