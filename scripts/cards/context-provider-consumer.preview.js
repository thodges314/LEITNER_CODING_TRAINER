const { ThemeProvider, useTheme } = createThemeContext();

function ConsumerDemo() {
  const { theme, toggle } = useTheme();
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        Current Theme: <strong style={{ color: '#38bdf8' }}>{theme}</strong>
      </div>
      <button
        type="button"
        onClick={() => {
          toggle();
          log('toggleTheme', theme === 'light' ? 'dark' : 'light');
        }}
        style={{ padding: '6px 12px', width: 'fit-content', borderRadius: '4px', cursor: 'pointer' }}
      >
        Toggle Theme
      </button>
    </div>
  );
}

function Demo() {
  const { defaultTheme = 'light' } = usePreviewProps({
    defaultTheme: 'light',
  });

  return (
    <ThemeProvider key={defaultTheme} defaultTheme={defaultTheme}>
      <ConsumerDemo />
    </ThemeProvider>
  );
}

<Demo />
