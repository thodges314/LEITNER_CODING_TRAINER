function Demo() {
  const {
    togglePressed = false,
    toggleChildren = 'Unmuted',
    formLabel = 'Email Address:',
    formHint = 'We will not share your email',
    formError = '',
    childControlType = 'input',
    childPlaceholder = 'you@domain.com',
    childDisabled = false,
  } = usePreviewProps({
    togglePressed: false,
    toggleChildren: 'Unmuted',
    formLabel: 'Email Address:',
    formHint: 'We will not share your email',
    formError: '',
    childControlType: 'input',
    childPlaceholder: 'you@domain.com',
    childDisabled: false,
  });

  const [activePressed, setActivePressed] = useState(togglePressed);
  const [val, setVal] = useState('');

  useEffect(() => {
    setActivePressed(togglePressed);
  }, [togglePressed]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {childControlType === 'textarea' ? (
              <textarea
                {...fieldProps}
                value={val}
                disabled={childDisabled}
                onChange={(e) => setVal(e.target.value)}
                placeholder={childPlaceholder}
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            ) : childControlType === 'generic-div' ? (
              <div
                {...fieldProps}
                tabIndex={childDisabled ? -1 : 0}
                role="textbox"
                contentEditable={!childDisabled}
                onInput={(e) => setVal(e.currentTarget.textContent || '')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #334155)',
                  minHeight: '36px',
                  outline: 'none',
                  cursor: childDisabled ? 'not-allowed' : 'text',
                  opacity: childDisabled ? 0.5 : 1,
                }}
              >
                {val || <span style={{ opacity: 0.5, pointerEvents: 'none' }}>{childPlaceholder}</span>}
              </div>
            ) : (
              <input
                {...fieldProps}
                type="text"
                value={val}
                disabled={childDisabled}
                onChange={(e) => setVal(e.target.value)}
                placeholder={childPlaceholder}
                style={{ width: '100%' }}
              />
            )}

            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '6px 10px',
                borderRadius: '5px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                background: 'rgba(56, 189, 248, 0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600, opacity: 0.8 }}>Received Render Props:</span>
              <span>id: <code>{fieldProps.id}</code></span>
              {fieldProps['aria-describedby'] && (
                <span>aria-describedby: <code>{fieldProps['aria-describedby']}</code></span>
              )}
              {fieldProps['aria-invalid'] && (
                <span>aria-invalid: <code style={{ color: '#ef4444' }}>true</code></span>
              )}
            </div>
          </div>
        )}
      </FormField>
    </div>
  );
}

<Demo />
