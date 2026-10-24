type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: string) => void;
  toggle: () => void;
}

interface ThemeProviderProps {
  children?: React.ReactNode;
  storageKey?: string;
  defaultTheme?: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEMES: readonly Theme[] = ['light', 'dark'];

function ThemeProvider({ children, storageKey = 'demo-color-scheme', defaultTheme = 'light' }: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved && (THEMES as readonly string[]).includes(saved) ? (saved as Theme) : defaultTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (next: string) => {
    if ((THEMES as readonly string[]).includes(next)) setThemeState(next as Theme);
  };
  const toggle = () => setThemeState((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

function useTheme(): ThemeContextValue {
  const ctx = useContext<ThemeContextValue | null>(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
}
