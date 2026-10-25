function Demo() {
  const {
    togglePressed = false,
    toggleChildren = 'Unmuted',
    formLabel = 'Email Address:',
    formHint = 'We will not share your email',
    formError = '',
  } = usePreviewProps({
    togglePressed: false,
    toggleChildren: 'Unmuted',
    formLabel: 'Email Address:',
    formHint: 'We will not share your email',
    formError: '',
  });

  const [activePressed, setActivePressed] = useState(togglePressed);
  const [val, setVal] = useState('');

  useEffect(() => {
    setActivePressed(togglePressed);
  }, [togglePressed]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <ToggleButton
          pressed={activePressed}
          onPressedChange={(next) => {
            setActivePressed(next);
            log('onPressedChange')(next);
          }}
        >
          {toggleChildren}
        </ToggleButton>
      </div>

      <FormField
        label={formLabel}
        hint={formHint || undefined}
        error={formError || (val.length > 0 && !val.includes('@') ? 'Invalid email address' : undefined)}
      >
        {(fieldProps) => (
          <input
            {...fieldProps}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="you@domain.com"
          />
        )}
      </FormField>
    </div>
  );
}

<Demo />
