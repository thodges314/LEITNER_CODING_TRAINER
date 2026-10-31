function Demo() {
  const { delayMs = 600, subscribe } = usePreviewProps({
    delayMs: 600,
  });

  const handleSubscribe = async (email) => {
    if (subscribe) {
      const res = await subscribe(email);
      log('subscribe', email, res);
      return res;
    }
    log('subscribe', email);
    await new Promise((resolve) => setTimeout(resolve, Number(delayMs) || 600));
    if (!email.includes('@')) {
      return { ok: false, error: 'Enter a valid email address with an @' };
    }
    return { ok: true };
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>
        React 19 useActionState form handling with pending status.
      </p>
      <SubscribeForm subscribe={handleSubscribe} />
    </div>
  );
}

<Demo />
