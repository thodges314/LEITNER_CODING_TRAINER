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
    <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[180px] gap-6">
      <SegmentedControl
        key={`${size}-${fullWidth}`}
        options={options}
        value={currentValue}
        onChange={handleChange}
        size={size}
        fullWidth={Boolean(fullWidth)}
      />

      <div className="text-xs text-slate-500 font-mono">
        Active frequency: <span className="text-indigo-400 font-semibold">{currentValue}</span>
      </div>
    </div>
  );
}

<SegmentedControlPreview />
