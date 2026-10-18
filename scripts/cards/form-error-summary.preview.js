<div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>
    Accessible error summary box moves focus when validation fails.
  </p>
  <SignupForm
    onSubmit={(values) => {
      log('onSubmit', values);
    }}
  />
</div>
