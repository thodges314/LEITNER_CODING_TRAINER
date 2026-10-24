function TagInput({
  value,
  onChange,
  max = Infinity,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}): JSX.Element {
  const [text, setText] = useState<string>('');

  const addTag = (): void => {
    const tag = text.trim();
    setText('');
    if (!tag) return;
    if (value.length >= max) return;
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const onKeyDown = (e: { key: string; preventDefault: () => void }): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && text === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <ul aria-label="Tags">
        {value.map((tag) => (
          <li key={tag}>
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <input aria-label="Add tag" value={text} onChange={(e: { target: { value: string } }) => setText(e.target.value)} onKeyDown={onKeyDown} />
    </div>
  );
}
