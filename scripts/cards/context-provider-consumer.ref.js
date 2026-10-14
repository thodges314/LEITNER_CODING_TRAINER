function createThemeContext() {
  const ThemeContext = createContext(null);

  function ThemeProvider({ children, defaultTheme = 'light' }) {
    const [theme, setTheme] = useState(defaultTheme);
    const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
    const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, toggle]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  }

  function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
  }

  return { ThemeProvider, useTheme };
}
