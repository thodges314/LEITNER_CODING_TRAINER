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
{
  const wrapper = ({ children }) => <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
  const h = renderHook(() => useTheme(), { wrapper });
  $test.check('defaultTheme sets the initial theme', h.result.current.theme === 'dark', h.result.current.theme);
  h.unmount();
}
{
  const seen = [];
  let bump;
  function Probe() {
    seen.push(useTheme());
    return null;
  }
  function Parent() {
    const [n, setN] = useState(0);
    bump = () => setN(n + 1);
    return (
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
  }
  const r = $dom.render(<Parent />);
  act(() => bump());
  $test.check('The context value keeps its identity while the theme does not change', seen.length >= 2 && seen[0] === seen[seen.length - 1], { renders: seen.length });
  r.unmount();
}
