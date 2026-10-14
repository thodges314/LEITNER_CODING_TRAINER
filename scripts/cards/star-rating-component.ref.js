function StarRating({ value = 0, onChange, max = 5 }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value;

  const onKeyDown = (e) => {
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, value + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, value - 1);
    if (next !== null) {
      e.preventDefault();
      if (onChange) onChange(next);
    }
  };

  return (
    <div role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(null)} onKeyDown={onKeyDown}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          tabIndex={n === value || (value === 0 && n === 1) ? 0 : -1}
          data-filled={n <= shown}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange && onChange(n === value ? 0 : n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
