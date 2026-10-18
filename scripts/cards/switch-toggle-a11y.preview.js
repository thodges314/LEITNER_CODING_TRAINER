function Demo() {
  const [on, setOn] = useState(false);
  const logger = log('onChange');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <Switch
        checked={on}
        onChange={(next) => {
          setOn(next);
          logger(next);
        }}
      >
        Wi-Fi {on ? 'Connected' : 'Disconnected'}
      </Switch>
      <Switch checked={false} disabled onChange={log('disabledSwitch')}>
        Bluetooth (Disabled)
      </Switch>
    </div>
  );
}

<Demo />
