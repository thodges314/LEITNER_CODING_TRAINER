function SegmentedControlPreview() {
  const {
    value = 'weekly',
    size = 'md',
    fullWidth = false,
  } = usePreviewProps({
    value: 'weekly',
    size: 'md',
    fullWidth: false,
  });

  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const handleChange = (next) => {
    setCurrentValue(next);
    if (typeof log === 'function') {
      log('onChange', next);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto flex items-center justify-center min-h-[140px]">
      <SegmentedControl
        key={`${size}-${fullWidth}`}
        options={options}
        value={currentValue}
        onChange={handleChange}
        size={size}
        fullWidth={Boolean(fullWidth)}
      />
    </div>
  );
}

<SegmentedControlPreview />
