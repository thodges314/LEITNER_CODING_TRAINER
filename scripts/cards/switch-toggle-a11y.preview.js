function Demo() {
  const { checked = false, disabled = false, children = 'Wi-Fi', onChange } = usePreviewProps({
    checked: false,
    disabled: false,
    children: 'Wi-Fi',
  });
  const [on, setOn] = useState(checked);
  useEffect(() => {
    setOn(checked);
  }, [checked]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', padding: '16px' }}>
      <Switch
        checked={on}
        disabled={Boolean(disabled)}
        onChange={(next) => {
          setOn(next);
          if (onChange) onChange(next);
          log('onChange', next);
        }}
      >
        {children} {on ? '(On)' : '(Off)'}
      </Switch>
    </div>
  );
}

<Demo />
