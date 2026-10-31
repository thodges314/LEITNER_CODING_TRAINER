const defaultTags = ['react', 'javascript', 'typescript'];

function Demo() {
  const {
    value = defaultTags,
    max = 5,
    onChange,
  } = usePreviewProps({
    value: defaultTags,
    max: 5,
  });

  const [tags, setTags] = useState(value);
  const tagKey = JSON.stringify(value);
  const prevKeyRef = useRef(tagKey);

  useEffect(() => {
    if (prevKeyRef.current !== tagKey) {
      prevKeyRef.current = tagKey;
      setTags(Array.isArray(value) ? value : defaultTags);
    }
  }, [tagKey, value]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>
        Press Enter or comma to add a tag, Backspace on empty input to remove last tag.
      </p>
      <TagInput
        value={tags}
        max={max !== undefined && max !== null && max !== '' ? Number(max) : Infinity}
        onChange={(next) => {
          setTags(next);
          if (onChange) onChange(next);
          log('onChange', next);
        }}
      />
    </div>
  );
}

<Demo />
