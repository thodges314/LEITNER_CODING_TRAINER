const { renderHook, renderError, act } = $dom;
const { ThemeProvider, useTheme } = createThemeContext();
{
  const h = renderHook(() => useTheme(), { wrapper: ThemeProvider });
  $test.check('Default theme is light inside the provider', h.result.current.theme === 'light', h.result.current.theme);
  act(() => h.result.current.toggle());
  const dark = h.result.current.theme;
  act(() => h.result.current.toggle());
  $test.check('toggle switches light and dark', dark === 'dark' && h.result.current.theme === 'light', { dark, back: h.result.current.theme });
  h.unmount();
}
{
  function Outside() {
    useTheme();
    return null;
  }
  const err = renderError(<Outside />);
  $test.check('Outside the provider useTheme throws a helpful error', err instanceof Error && /ThemeProvider/.test(err.message), err && err.message);
}
