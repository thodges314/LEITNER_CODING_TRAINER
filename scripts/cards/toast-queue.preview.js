function ToastTrigger() {
  const { show } = useToast();
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        type="button"
        onClick={() => {
          show('Changes saved successfully!', { duration: 4000 });
          log('showToast')('saved');
        }}
        style={{ padding: '6px 12px' }}
      >
        Show Toast
      </button>
      <button
        type="button"
        onClick={() => {
          show('Network sync warning', { duration: 4000 });
          log('showToast')('warning');
        }}
        style={{ padding: '6px 12px' }}
      >
        Warning Toast
      </button>
    </div>
  );
}

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <ToastProvider limit={3}>
        <ToastTrigger />
      </ToastProvider>
    </div>
  );
}

<Demo />
