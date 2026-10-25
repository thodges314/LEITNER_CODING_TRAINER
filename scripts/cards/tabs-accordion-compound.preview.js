function Demo() {
  const {
    defaultValue = 'account',
    value,
    onChange,
  } = usePreviewProps({
    defaultValue: 'account',
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Tabs
        defaultValue={defaultValue}
        value={value || undefined}
        onChange={(v) => {
          if (onChange) onChange(v);
          log('onChange', v);
        }}
      >
        <TabList>
          <Tab value="account">Account</Tab>
          <Tab value="password">Password</Tab>
          <Tab value="settings">Settings</Tab>
        </TabList>
        <TabPanel value="account">
          <div style={{ padding: '12px 0', fontSize: '13px', color: '#94a3b8' }}>Account settings and profile preferences.</div>
        </TabPanel>
        <TabPanel value="password">
          <div style={{ padding: '12px 0', fontSize: '13px', color: '#94a3b8' }}>Manage login credentials and two-factor auth.</div>
        </TabPanel>
        <TabPanel value="settings">
          <div style={{ padding: '12px 0', fontSize: '13px', color: '#94a3b8' }}>Notification alerts and theme configuration.</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

<Demo />
