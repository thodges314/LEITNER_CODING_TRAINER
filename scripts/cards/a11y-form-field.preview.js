function Demo() {
  const [pressed, setPressed] = useState(false);
  const [val, setVal] = useState('');

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <ToggleButton
          pressed={pressed}
          onPressedChange={(next) => {
            setPressed(next);
            log('onPressedChange')(next);
          }}
        >
          {pressed ? 'Muted' : 'Unmuted'}
        </ToggleButton>
      </div>

      <FormField
        label="Email Address:"
        hint="We will not share your email"
        error={val.length > 0 && !val.includes('@') ? 'Invalid email address' : undefined}
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
