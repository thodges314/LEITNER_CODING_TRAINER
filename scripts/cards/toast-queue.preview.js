function ToastTrigger({ message, duration }) {
  const { show } = useToast();
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        type="button"
        onClick={() => {
          show(message || 'Changes saved successfully!', { duration: Number(duration) || 3000 });
          log('showToast', message);
        }}
        style={{ padding: '6px 12px' }}
      >
        Show Toast
      </button>
      <button
        type="button"
        onClick={() => {
          show('Network sync warning', { duration: Number(duration) || 3000 });
          log('showToast', 'Network sync warning');
        }}
        style={{ padding: '6px 12px' }}
      >
        Warning Toast
      </button>
    </div>
  );
}

function Demo() {
  const {
    limit = 3,
    duration = 3000,
    message = 'Changes saved successfully!',
  } = usePreviewProps({
    limit: 3,
    duration: 3000,
    message: 'Changes saved successfully!',
  });

  const parsedLimit = Number(limit) || 3;

  return (
    <div style={{ padding: '16px' }}>
      <ToastProvider key={parsedLimit} limit={parsedLimit}>
        <ToastTrigger message={message} duration={duration} />
      </ToastProvider>
    </div>
  );
}

<Demo />
