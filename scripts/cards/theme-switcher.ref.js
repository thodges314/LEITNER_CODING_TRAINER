const ThemeContext = createContext(null);
const THEMES = ['light', 'dark'];

function ThemeProvider({ children, storageKey = 'demo-color-scheme', defaultTheme = 'light' }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return THEMES.includes(saved) ? saved : defaultTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (next) => {
    if (THEMES.includes(next)) setThemeState(next);
  };
  const toggle = () => setThemeState((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
}
