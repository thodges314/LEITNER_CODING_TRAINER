function Demo() {
  const {
    value: controlledValue = 3,
    max = 5,
    onChange = log('onChange'),
  } = usePreviewProps({
    value: 3,
    max: 5,
    onChange: log('onChange'),
  });

  const [rating, setRating] = useState(controlledValue);

  useEffect(() => {
    setRating(controlledValue);
  }, [controlledValue]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <StarRating
        value={rating}
        max={max}
        onChange={(next) => {
          setRating(next);
          onChange(next);
        }}
      />
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        Current rating: <strong style={{ color: '#e2e8f0' }}>{rating}</strong> / {max}
      </div>
    </div>
  );
}

<Demo />
